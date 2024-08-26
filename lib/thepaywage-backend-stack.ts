import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
//LAMBDA
import * as lambda from 'aws-cdk-lib/aws-lambda';
//iam
import * as iam from 'aws-cdk-lib/aws-iam';
//COGNITO
import * as cognito from 'aws-cdk-lib/aws-cognito';



interface ThepaywageProps extends cdk.StackProps {
  environmentName: string;
  env: { account: string, region: string }, /* default */
  sesEmail: string;
}

export class ThepaywageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ThepaywageProps) {
    super(scope, id, props);




    const region = this.region;
    const email = props.sesEmail;




    //**************************LAMBDA**************************/
    //creating lambdafunction
    const thepaywageLambda = new lambda.Function(this, 'thepaywage-lambda', {
      functionName: "thepaywage-lambda-" + props.environmentName,
      runtime: lambda.Runtime.NODEJS_18_X,
      code: new lambda.AssetCode("lambda"),
      handler: 'thepaywage-lambda.handler',
      currentVersionOptions: {
        //async retry attempts
        retryAttempts: 0
      },
      //giving timeout
      timeout: cdk.Duration.minutes(1),
      //giving environment
      environment: {
        SES_REGION: region,
        FROM_EMAIL: email
      }
    });


    //permissions for send emails using SES
    const sesPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:SendEmail'],
      resources: ['*']
    });


    //assign permissions to the lambdafunction of SES
    thepaywageLambda.addToRolePolicy(sesPolicy);
    //**************************LAMBDA**************************/ 




    //*****************************COGNTIO**********************************/
    //creating userpool
    const userPool = new cognito.UserPool(this, 'thepaywage-userPool', {
      userPoolName: "thepaywage-userPool-" + props.environmentName,


      //user can sigin with 'email' ( can also include username, phone, preferredUsername )
      signInAliases: {
        email: true
      },


      //defining policies for 'password' ( default policies are all true )
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true
      },


      //allow users for 'signup' to create account ( so not only administrator makes account )
      selfSignUpEnabled: true,


      //user can recover account with 'email' only ( can also include PHONE_ONLY, PHONE_AND_EMAIL, etc )
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,


      //verification while creating an account using 'email' by sending a verification link ( can also add phone )
      autoVerify: {
        email: true
      },


      //customize your 'email' verification message ( can also add phone )
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.LINK
      },


      //hit lambdafuntion trigger
      lambdaTriggers: {
        postConfirmation: thepaywageLambda,
        postAuthentication: thepaywageLambda,
        customMessage: thepaywageLambda
      },


      //extra attributes to save
      standardAttributes: {
        givenName: {    /*firstName*/
          required: true,
          mutable: true,
        },
        familyName: {   /*lastName*/
          required: true,
          mutable: true
        },
        email: {        /*email*/
          required: true,
          mutable: true
        },
        phoneNumber: {  /*phone*/
          required: true,
          mutable: true
        }
      }
    });


    //creating 'Client' for connect COGNITO with frontend
    const userPoolClient = new cognito.UserPoolClient(this, 'thepaywage-userPoolClient', {
      userPool
    });


    //send by userpool
    new cdk.CfnOutput(this, 'thepaywage-userPoolClientId', {
      value: userPoolClient.userPoolClientId
    });


    //send by userpool
    new cdk.CfnOutput(this, 'thepaywage-userPoolId', {
      value: userPool.userPoolId
    });


    //create a domain name for the userpool
    const domain = userPool.addDomain('thepaywage-domain', {
      cognitoDomain: {
        //this will create a domain like https://thepaywage-dev.<region>.amazoncognito.com
        domainPrefix: "thepaywage-" + props.environmentName
      },
    });


    //send by userpool
    new cdk.CfnOutput(this, 'thepaywage-domainName', {
      value: domain.domainName
    });
    //*****************************COGNTIO**********************************/
  }
}