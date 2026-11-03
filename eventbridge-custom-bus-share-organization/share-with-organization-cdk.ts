import * as cdk from 'aws-cdk-lib';
import * as eventsv2 from 'aws-cdk-lib/aws-eventsv2';
import * as ram from 'aws-cdk-lib/aws-ram';
import { Construct } from 'constructs';

interface OrganizationShareStackProps extends cdk.StackProps {
  readonly eventBusName: string;
  readonly organizationPrincipalArn: string;
}

class OrganizationShareStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: OrganizationShareStackProps) {
    super(scope, id, props);

    const bus = new eventsv2.CfnEventBus(this, 'EventBus', {
      name: props.eventBusName,
      storageConfiguration: {
        retentionPeriodInDays: 7,
      },
    });

    const share = new ram.CfnResourceShare(this, 'EventBusShare', {
      name: `${this.stackName}-share`,
      resourceArns: [bus.attrEventBusArn],
      principals: [props.organizationPrincipalArn],
      permissionArns: [
        `arn:${cdk.Aws.PARTITION}:ram::aws:permission/AWSRAMEventBridgeEventBusV2SubscribeOnly`,
      ],
      allowExternalPrincipals: false,
    });

    new cdk.CfnOutput(this, 'EventBusArn', {
      value: bus.attrEventBusArn,
    });

    new cdk.CfnOutput(this, 'ResourceShareArn', {
      value: share.attrArn,
    });
  }
}

const app = new cdk.App();
const eventBusName = app.node.tryGetContext('eventBusName');
const organizationPrincipalArn = app.node.tryGetContext('organizationPrincipalArn');

if (!eventBusName || !organizationPrincipalArn) {
  throw new Error('Provide -c eventBusName=<NAME> -c organizationPrincipalArn=<ORG_OR_OU_ARN>');
}

new OrganizationShareStack(app, 'EventBridgeV2OrganizationShare', {
  eventBusName,
  organizationPrincipalArn,
});
