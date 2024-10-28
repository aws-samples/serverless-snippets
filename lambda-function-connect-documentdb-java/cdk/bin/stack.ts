import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as docdb from 'aws-cdk-lib/aws-docdb';
import * as iam from 'aws-cdk-lib/aws-iam';

export class DocumentDbLambdaSampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'DocumentDbVpc', {
      maxAzs: 2,
      natGateways: 1,
      vpcName: 'DocumentDBLambdaSample',
      subnetConfiguration: [
        {
          cidrMask: 24,
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          name: "PrivateSubnetWithEgress"
        },
        {
          cidrMask: 24,
          subnetType: ec2.SubnetType.PUBLIC,
          name: "PublicSubnet"
        },
      ],
    });

    const documentDBCluster = new docdb.DatabaseCluster(this, 'DocumentDBCluster', {
      dbClusterName: "lambda-java-sample-cluster",
      masterUser: {
        username: 'sampleuser',
        excludeCharacters: "\"@/:",
        secretName: "DocumentDbSecret",
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
      },
      parameterGroup: new docdb.ClusterParameterGroup(this, "TlsDisabled", { // The default setting is to enable TLS, which makes connecting more secure but also more involved. We disable it for this sample
        dbClusterParameterGroupName: "default-with-tls-disabled",
        description: "All settings are default, but TLS is disabled for convenience in this sample",
        parameters: {
          audit_logs: "disabled",
          change_stream_log_retention_duration: "10800",
          profiler: "disabled",
          profiler_sampling_rate: "1.0",
          profiler_threshold_ms: "100",
          tls: "disabled",
          ttl_monitor: "enabled",
        },
        family: "docdb5.0"
      })
    });

    documentDBCluster.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    const api = new apigateway.RestApi(this, 'ApiGateway', {
      restApiName: 'API',
    });

    const createMovie = createLambdaFunction(this, vpc, documentDBCluster, 'DocumentDBCreateSample', 'Create');
    const retrieveMovie = createLambdaFunction(this, vpc, documentDBCluster, 'DocumentDBRetrieveSample', 'Retrieve');
    const updateMovie = createLambdaFunction(this, vpc, documentDBCluster, 'DocumentDBUpdateSample', 'Update');
    const deleteMovie = createLambdaFunction(this, vpc, documentDBCluster, 'DocumentDBDeleteSample', 'Delete');
    const queryMovie = createLambdaFunction(this, vpc, documentDBCluster, 'DocumentDBQuerySample', 'Query');

    const moviesResource = api.root.addResource('movies');
    moviesResource.addMethod('GET', new apigateway.LambdaIntegration(queryMovie));
    moviesResource.addMethod('POST', new apigateway.LambdaIntegration(createMovie));

    const movieResource = moviesResource.addResource('{id}');
    movieResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteMovie));
    movieResource.addMethod('GET', new apigateway.LambdaIntegration(retrieveMovie));
    movieResource.addMethod('PATCH', new apigateway.LambdaIntegration(updateMovie));
  }
}

function createLambdaFunction(scope: Construct, vpc: ec2.Vpc, documentDBCluster: docdb.DatabaseCluster, functionName: string, handler: string) {
  const lambdaFunction = new lambda.Function(scope, functionName, {
    runtime: lambda.Runtime.JAVA_17,
    code: lambda.Code.fromAsset("../lambda/build/distributions/lambda.zip"),
    functionName: functionName,
    memorySize: 5000,
    handler: `documentdb.sample.${handler}`,
    timeout: cdk.Duration.minutes(2),
    vpc: vpc,
    vpcSubnets: {
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
    },
    environment: {
      DOCUMENTDB_SECRET_NAME: documentDBCluster.secret?.secretName!,
    },
  });

  lambdaFunction.connections.securityGroups.forEach(sg => {
    documentDBCluster.connections.allowFrom(sg, ec2.Port.tcp(27017))
  })

  lambdaFunction.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
    actions: ['secretsmanager:GetSecretValue'],
    resources: [documentDBCluster.secret!.secretFullArn!],
    effect: iam.Effect.ALLOW
  }));

  return lambdaFunction;
}