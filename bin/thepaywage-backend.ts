#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ThepaywageStack } from '../lib/thepaywage-backend-stack';



const app = new cdk.App();
/* https://docs.aws.amazon.com/cdk/v2/guide/environments.html */



//DEV Environment
new ThepaywageStack(app, 'ThepaywageStack-DEV', {
    environmentName: 'dev',
    env: { account: "054037122184", region: "ap-southeast-2" },
    sesEmail: 'mirshah1993@gmail.com'
});


//PROD Environment
new ThepaywageStack(app, 'ThepaywageStack-PROD', {
    environmentName: 'prod',
    env: { account: "054037122184", region: "ap-southeast-2" },
    sesEmail: 'mirshah1993@gmail.com'
});


//TEST Environment
new ThepaywageStack(app, 'ThepaywageStack-TEST', {
    environmentName: 'test',
    env: { account: "054037122184", region: "ap-southeast-2" },
    sesEmail: 'mirshah1993@gmail.com'
});