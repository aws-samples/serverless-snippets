import * as cdk from 'aws-cdk-lib';
import * as ram from 'aws-cdk-lib/aws-ram';
import { Construct } from 'constructs';

interface AccountShareStackProps extends cdk.StackProps {
  readonly eventBusArn: string;
  readonly consumerAccountId: string;
}

class AccountShareStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AccountShareStackProps) {
    super(scope, id, props);

    const share = new ram.CfnResourceShare(this, 'EventBusShare', {
      name: `${this.stackName}-share`,
      resourceArns: [props.eventBusArn],
      principals: [props.consumerAccountId],
      permissionArns: [
        `arn:${cdk.Aws.PARTITION}:ram::aws:permission/AWSRAMEventBridgeEventBusV2SubscribeOnly`,
      ],
      allowExternalPrincipals: true,
    });

    new cdk.CfnOutput(this, 'ResourceShareArn', {
      value: share.attrArn,
    });
  }
}

const app = new cdk.App();
const eventBusArn = app.node.tryGetContext('eventBusArn');
const consumerAccountId = app.node.tryGetContext('consumerAccountId');

if (!eventBusArn || !consumerAccountId) {
  throw new Error('Provide -c eventBusArn=<ARN> -c consumerAccountId=<ACCOUNT_ID>');
}

const eventBusRegion = eventBusArn.split(':')[3];
const eventBusAccount = eventBusArn.split(':')[4];

new AccountShareStack(app, 'EventBridgeV2AccountShare', {
  env: {
    account: eventBusAccount,
    region: eventBusRegion,
  },
  eventBusArn,
  consumerAccountId,
});
