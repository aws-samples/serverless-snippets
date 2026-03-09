from pathlib import Path
from aws_cdk import (
    aws_lambda as lambda_,
    aws_logs as logs,
    BundlingOptions,
    Duration,
    RemovalPolicy,
    Stack,
)
from constructs import Construct


class StandardLambda(Construct):
    """
    A reusable CDK Construct that provides a standardized blueprint for creating
    AWS Lambda functions — similar to the Global section of an AWS SAM template.

    This construct automatically includes:
    - A dedicated CloudWatch Log Group with configurable retention and removal policies,
      along with IAM permissions for the Lambda function to write logs.
    - The AWS Lambda Powertools for Python V3 layer (managed by AWS), pre-configured
      with POWERTOOLS_SERVICE_NAME and LOG_LEVEL environment variables.
    - X-Ray active tracing enabled by default.
    - Container-based dependency bundling when a requirements.txt file is detected.

    All default settings can be overridden per function. Environment variables and
    layers are merged (not replaced) so that Powertools config is always preserved
    unless explicitly overridden.

    The function and its execution role are exposed as public attributes (self.function
    and self.role) so consumers can grant additional IAM permissions after creation.
    """

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        handler: str,
        code_path: str,
        runtime: lambda_.Runtime = lambda_.Runtime.PYTHON_3_14,
        log_retention: logs.RetentionDays = logs.RetentionDays.ONE_WEEK,
        log_removal_policy: RemovalPolicy = RemovalPolicy.DESTROY,
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id)

        # Get the current stack reference — used to resolve region-specific ARNs
        # (e.g. the Powertools layer ARN which varies by region)
        stack = Stack.of(self)

        # Automatically detect whether the Lambda code directory contains a
        # requirements.txt with real dependencies. If it does, Container bundling
        # is used to install them into the deployment package. If not, the code
        # directory is packaged as-is.
        code = self._build_code(code_path, runtime)

        # Create a dedicated CloudWatch Log Group for this Lambda function.
        # Let CDK auto-generate the name based on the Lambda function name — this avoids naming
        # collisions and keeps log groups tidy.
        # The retention and removal policy are configurable via constructor
        # parameters, defaulting to ONE_WEEK retention and DESTROY on stack deletion.
        log_group = logs.LogGroup(
            self,
            "LogGroup",
            retention=log_retention,
            removal_policy=log_removal_policy,
        )

        # Resolve the architecture — default to ARM_64 for better price/performance,
        # but allow the consumer to override it via kwargs.
        architecture = kwargs.pop("architecture", lambda_.Architecture.ARM_64)

        # Determine the correct Powertools layer ARN based on both architecture
        # and runtime. AWS publishes separate Powertools layers per combination:
        #   - AWSLambdaPowertoolsPythonV3-python313-arm64
        #   - AWSLambdaPowertoolsPythonV3-python313-x86_64
        #   - AWSLambdaPowertoolsPythonV3-python314-arm64
        #   - AWSLambdaPowertoolsPythonV3-python314-x86_64
        # See: https://docs.powertools.aws.dev/lambda/python/latest/
        arch_suffix = "arm64" if architecture.name == "arm64" else "x86_64"

        # Extract the Python version string from the runtime name (e.g. "python3.14"
        # becomes "python314") to match the Powertools layer naming convention.
        # runtime.name returns the format "python3.14", so we strip the dot.
        runtime_suffix = runtime.name.replace(".", "")

        powertools_layer = lambda_.LayerVersion.from_layer_version_arn(
            self,
            "PowertoolsLayer",
            f"arn:aws:lambda:{stack.region}:017000801446:layer:AWSLambdaPowertoolsPythonV3-{runtime_suffix}-{arch_suffix}:27",
        )

        # Define the default configuration that every Lambda function created
        # by this construct will inherit. These values represent sensible
        # defaults for a serverless application:
        # - ARM_64 architecture (or consumer-specified) for better price/performance
        # - 30 second timeout
        # - 256 MB memory
        # - Powertools layer (architecture-matched) included
        # - X-Ray active tracing enabled
        # - Powertools environment variables pre-configured
        # - The dedicated log group attached
        defaults = {
            "runtime": runtime,
            "architecture": architecture,
            "timeout": Duration.seconds(30),
            "memory_size": 256,
            "layers": [powertools_layer],
            "environment": {
                "POWERTOOLS_SERVICE_NAME": construct_id,
                "LOG_LEVEL": "DEBUG",
            },
            "tracing": lambda_.Tracing.ACTIVE,
            "log_group": log_group,
        }

        # Handle layers and environment variables separately from other kwargs.
        # We pop them out before the general merge so we can combine them
        # (append/merge) rather than replace the defaults entirely.
        # This ensures the Powertools layer and its env vars are always present
        # even when the consumer provides additional layers or env vars.
        user_layers = kwargs.pop("layers", None)
        user_environment = kwargs.pop("environment", None)

        # Merge all remaining kwargs with defaults. User-provided values
        # take precedence over defaults (e.g. a custom timeout or memory_size).
        merged_config = {**defaults, **kwargs}


        # Merge layers additively — the consumer's layers are appended
        # after the Powertools layer so all layers are included.
        if user_layers is not None:
            merged_config["layers"] = defaults.get("layers", []) + user_layers
            
        # Merge environment variables additively — the consumer's env vars
        # are added alongside the Powertools defaults, not replacing them.
        if user_environment is not None:
            merged_config["environment"] = {
                **defaults.get("environment", {}),
                **user_environment,
            }

        # Create the Lambda function with the merged configuration.
        self.function = lambda_.Function(
            self, "Function", handler=handler, code=code, **merged_config
        )

        # Grant the Lambda function permission to write logs to its dedicated
        # CloudWatch Log Group. 
        log_group.grant_write(self.function)

        # Expose the function's IAM execution role as a public attribute.
        # This allows consumers to attach additional permissions after
        # creating the construct, e.g.:
        #   my_lambda.role.add_managed_policy(...)
        #   my_table.grant_read_write_data(my_lambda.function)
        self.role = self.function.role

    def _build_code(self, code_path: str, runtime: lambda_.Runtime) -> lambda_.Code:
        """
        Build the Lambda deployment package with automatic dependency detection.

        Checks for a requirements.txt in the code directory. If one exists and
        contains real dependencies (not just comments or blank lines), Container
        bundling is used: a container with the matching Lambda runtime image
        runs pip install into /asset-output, then copies the function code
        alongside the installed packages. This produces a flat deployment zip
        where Python can import everything directly.

        If no requirements.txt is found (or it's empty), the code directory
        is simply packaged as-is with no Docker overhead.
        """
        code_dir = Path(code_path)
        requirements_file = code_dir / "requirements.txt"

        if requirements_file.exists() and self._has_dependencies(requirements_file):
            # Use Container bundling: spin up a container with the Lambda runtime
            # image, install dependencies into /asset-output (which becomes the
            # root of the deployment zip), then copy the function code into the
            # same directory so everything is flat and importable.
            return lambda_.Code.from_asset(
                code_path,
                bundling=BundlingOptions(
                    image=runtime.bundling_image,
                    command=[
                        "bash",
                        "-c",
                        " && ".join(
                            [
                                # Install dependencies 
                                "pip install -r requirements.txt -t /asset-output/",
                                # Copy the function source code alongside the
                                # installed dependencies
                                "cp -r . /asset-output",
                            ]
                        ),
                    ],
                ),
            )

        # No dependencies found — package the code directory directly
        # without spinning up a Docker container
        return lambda_.Code.from_asset(code_path)

    def _has_dependencies(self, requirements_file: Path) -> bool:
        """
        Check if a requirements.txt file contains actual package dependencies.
        Returns False if the file is empty or contains only comments and blank lines.
        This avoids unnecessary Docker bundling for functions with no external deps.
        """
        try:
            with open(requirements_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    # Skip empty lines and comment-only lines
                    if line and not line.startswith("#"):
                        return True
            return False
        except Exception:
            return False
