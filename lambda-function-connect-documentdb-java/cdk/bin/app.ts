#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DocumentDbLambdaSampleStack } from '../lib/stack';

const app = new cdk.App();
new DocumentDbLambdaSampleStack(app, 'DocumentDbLambdaSampleStack');
