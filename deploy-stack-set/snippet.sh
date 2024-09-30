#!/bin/bash
# This script demonstrates commands which can be used to deploy Cloudformation Stack Set Instances using AWS CLI in the same AWS account across regions.

# Pre-requisites 
# 1. AWS CLI should be installed
# 2. AWS Account should be created
# 3. AWS CLI should be configured with AWS Account credentials and required region.
# 4. You can use Cloudshell Instance in the same region to avoid step 1-3 to execute these commands. How to use Cloudshell: https://aws.amazon.com/blogs/aws/aws-cloudshell-command-line-access-to-aws-resources/
# 5. Make sure you navigate to the direcetory where you have your cloudformation template and also upload the following templates in the same directory
# 6. AWSCloudFormationStackSetAdministrationRole.yml: https://s3.amazonaws.com/cloudformation-stackset-sample-templates-us-east-1/AWSCloudFormationStackSetAdministrationRole.yml
# 7. AWSCloudFormationStackSetExecutionRole.yml: https://s3.amazonaws.com/cloudformation-stackset-sample-templates-us-east-1/AWSCloudFormationStackSetExecutionRole.yml

# Get inputs from user
read -p "Enter AWS Account ID : " AWS_ACCOUNT_ID
read -p "Enter Region list where stack instances need to be deployed separated by space (eg: us-east-1 ap-south-1 etc): " REGION_LIST
read -p "Enter Cloudformation template file name : " TEMPLATE_NAME
read -p "Enter Stack Set name : " STACK_SET_NAME




# Deploy stack set
aws cloudformation deploy --template AWSCloudFormationStackSetAdministrationRole.yml  --stack-name CloudformationStackSetAdministratorRole --capabilities CAPABILITY_NAMED_IAM
aws cloudformation deploy --template AWSCloudFormationStackSetExecutionRole.yml --stack-name CloudformationStackSetExecutionRole --capabilities CAPABILITY_NAMED_IAM --parameter-overrides AdministratorAccountId=$AWS_ACCOUNT_ID
aws cloudformation create-stack-set --stack-set-name $STACK_SET_NAME --template-body file://$TEMPLATE_NAME --capabilities CAPABILITY_NAMED_IAM
aws cloudformation create-stack-instances --stack-set-name $STACK_SET_NAME --accounts $AWS_ACCOUNT_ID --regions $REGION_LIST







