# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

from aws_cdk import (
    aws_iam as iam,
    aws_lambda as lambda_,
    Duration,
    Stack,
)
from constructs import Construct
from cdk.constructs.standard_lambda_construct import StandardLambda


class StandardLambdaExample(Stack):
    """
    Example CDK stack demonstrating three usage patterns of the StandardLambda
    construct: a minimal function, a function with overridden defaults, and a
    function with external dependencies and additional layers/permissions.
    """

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        stack = Stack.of(self)

        # Resolve the deployment region — used below to build region-specific
        # layer ARNs (e.g. Lambda Insights)
        region = stack.region

        # ---------------------------------------------------------------
        # Example 1: Minimal Lambda — no external dependencies
        # ---------------------------------------------------------------
        # Demonstrates the simplest usage of the StandardLambda construct.
        # The "lambda/simple" directory contains only the handler code and
        # empty requirements.txt, so CDK packages the code as a plain asset
        # without spinning up a Container.
        #
        # All defaults from the construct are inherited:
        #   - Python 3.14 runtime on ARM_64
        #   - 256 MB memory, 30s timeout
        #   - Powertools layer + environment variables
        #   - Dedicated CloudWatch Log Group with 1-week retention
        #   - X-Ray active tracing
        simple_lambda = StandardLambda(
            self,
            "SimpleLambda",
            handler="index.handler",
            code_path="lambda/simple",
        )

        # ---------------------------------------------------------------
        # Example 2: Overriding defaults — custom runtime and env vars
        # ---------------------------------------------------------------
        # Demonstrates how to override construct defaults on a per-function
        # basis. Here we pin the runtime to Python 3.13 and add a custom
        # environment variable.
        override_lambda = StandardLambda(
            self,
            "OverrideLambda",
            handler="index.handler",
            code_path="lambda/simple",
            runtime=lambda_.Runtime.PYTHON_3_13,
            environment={
                "CUSTOM_VAR": "custom_value",
                # POWERTOOLS_SERVICE_NAME and LOG_LEVEL are still included
                # automatically via the construct's merge logic
            },
        )

        # ---------------------------------------------------------------
        # Example 3: Lambda with dependencies, extra layers, and permissions
        # ---------------------------------------------------------------
        # Demonstrates a more complex function that:
        #   1. Has external pip dependencies (requirements.txt exists in
        #      "lambda/dependency"), so Container bundling kicks in automatically.
        #   2. Uses X86_64 architecture instead of the default ARM_64 — the
        #      construct automatically selects the matching Powertools layer ARN.
        #   3. Adds an additional Lambda layer (CloudWatch Lambda Insights)
        #      on top of the default Powertools layer — layers are merged,
        #      not replaced.
        #   4. Overrides timeout (60s) and memory (512 MB) for a heavier
        #      workload.
        #   5. Attaches an additional IAM managed policy to the function's
        #      execution role via the exposed self.role attribute.

        # Look up the AWS-managed Lambda Insights extension layer for X86_64.
        # This provides enhanced monitoring metrics in CloudWatch.
        lambda_insights_layer = lambda_.LayerVersion.from_layer_version_arn(
            self,
            "LambdaInsightsLayer",
            f"arn:aws:lambda:{region}:580247275435:layer:LambdaInsightsExtension:31",
        )

        dependency_lambda = StandardLambda(
            self,
            "DependencyLambda",
            handler="index.handler",
            code_path="lambda/dependency",
            architecture=lambda_.Architecture.X86_64,
            timeout=Duration.seconds(60),
            layers=[lambda_insights_layer],
            memory_size=512,
        )

        # Grant the Lambda Insights managed policy to the function's role.
        # This is needed for the Insights layer to publish enhanced metrics.
        # Uses the exposed self.role attribute from the construct.
        dependency_lambda.role.add_managed_policy(
            iam.ManagedPolicy.from_aws_managed_policy_name(
                "CloudWatchLambdaInsightsExecutionRolePolicy"
            )
        )
