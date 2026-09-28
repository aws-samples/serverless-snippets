import * as cdk from 'aws-cdk-lib';
import * as ram from 'aws-cdk-lib/aws-ram';
import { Construct } from 'constructs';

interface OrganizationShareStackProps extends cdk.StackProps {
  readonly eventBusArn: string;
  readonly organizationPrincipalArn: string;
}

class OrganizationShareStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: OrganizationShareStackProps) {
    super(scope, id, props);

    const share = new ram.CfnResourceShare(this, 'EventBusShare', {
      name: `${this.stackName}-share`,
      resourceArns: [props.eventBusArn],
      principals: [props.organizationPrincipalArn],
      permissionArns: [
        `arn:${cdk.Aws.PARTITION}:ram::aws:permission/AWSRAMEventBridgeEventBusV2SubscribeOnly`,
      ],
      allowExternalPrincipals: false,
    });

    new cdk.CfnOutput(this, 'ResourceShareArn', {
      value: share.attrArn,
    });
  }
}

const app = new cdk.App();
const eventBusArn = app.node.tryGetContext('eventBusArn');
const organizationPrincipalArn = app.node.tryGetContext('organizationPrincipalArn');

if (!eventBusArn || !organizationPrincipalArn) {
  throw new Error('Provide -c eventBusArn=<ARN> -c organizationPrincipalArn=<ORG_OR_OU_ARN>');
}

const eventBusRegion = eventBusArn.split(':')[3];
const eventBusAccount = eventBusArn.split(':')[4];

new OrganizationShareStack(app, 'EventBridgeV2OrganizationShare', {
  env: {
    account: eventBusAccount,
    region: eventBusRegion,
  },
  eventBusArn,
  organizationPrincipalArn,
});
