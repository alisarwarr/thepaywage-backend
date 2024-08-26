//AWS
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: process.env.SES_REGION });
//MOMENTJS
const moment = require('moment');


exports.handler = async (event: any) => {

    /*************************************customMessageLambda*************************************/
    if (
        event.triggerSource === "CustomMessage_SignUp"
    ) {
        const link = event.request.linkParameter;
        const username = event.request.userAttributes.given_name+" "+event.request.userAttributes.family_name;

        event.response.emailSubject = 'Thepaywage - Account Verification Request';
        event.response.emailMessage = `Hello, ${username}!<br><br>Click the link to verify your account: ${link}.<br><br>Best regards.`;
    }


    else if (
        event.triggerSource === "CustomMessage_ForgotPassword"
    ) {
        const email = event.request.userAttributes.email;
        const code = event.request.codeParameter;
        const username = event.request.userAttributes.given_name+" "+event.request.userAttributes.family_name;

        const resetLink = `https://main.d1aebp4rq5bbnw.amplifyapp.com/forgot-password?email=${email}&code=${code}`;

        event.response.emailSubject = 'Thepaywage - Password Reset Request';
        event.response.emailMessage = `Hello, ${username}!<br><br>Click the link to reset your password: ${resetLink}.<br><br>Best regards.`;
    }
    /*************************************customMessageLambda*************************************/


    /*************************************postConfirmationLambda*************************************/
    else if (
        event.triggerSource === "PostConfirmation_ConfirmSignUp"
    ) {
        const username = event.request.userAttributes.given_name+" "+event.request.userAttributes.family_name;


        const emailParams = {
            Source: process.env.FROM_EMAIL,
            Destination: {
                ToAddresses: [event.request.userAttributes.email]
            },
            Message: {
                Subject: {
                    Data: 'Thepaywage - Warm Welcome'
                },
                Body: {
                    Text: {
                        Data: `Hello, ${username}!\n\nWelcome to Thepaywage! We're excited to have you on board.\n\nBest regards.`
                    }
                }
            }
        };
    
    
        try {
            await ses.sendEmail(emailParams).promise();
            console.log('Email sent successfully');
        }
        catch (error) {
            console.error('Error sending email:', error);
        }
    }


    else if (
        event.triggerSource === "PostConfirmation_ConfirmForgotPassword"
    ) {
        const username = event.request.userAttributes.given_name+" "+event.request.userAttributes.family_name;


        const emailParams = {
            Source: process.env.FROM_EMAIL,
            Destination: {
                ToAddresses: [event.request.userAttributes.email]
            },
            Message: {
                Subject: {
                    Data: 'Thepaywage - Password Changed'
                },
                Body: {
                    Text: {
                        Data: `Hello, ${username}!\n\nUpdate from Thepaywage! Your password has been successfully changed.\n\nBest regards.`
                    }
                }
            }
        };
    
    
        try {
            await ses.sendEmail(emailParams).promise();
            console.log('Email sent successfully');
        }
        catch (error) {
            console.error('Error sending email:', error);
        }
    }
    /*************************************postConfirmationLambda*************************************/


    /*************************************postAuthenticationLambda*************************************/
    else if (
        event.triggerSource === "PostAuthentication_Authentication"
    ) {
        const username = event.request.userAttributes.given_name+" "+event.request.userAttributes.family_name;
        const timeDate = (moment(new Date().toISOString())).format('hh:mmA DD/MM/YYYY');


        const emailParams = {
            Source: process.env.FROM_EMAIL,
            Destination: {
                ToAddresses: [event.request.userAttributes.email]
            },
            Message: {
                Subject: { 
                    Data: 'Thepaywage - Recent Login'
                },
                Body: {
                    Text: {
                        Data: `Hello ${username}!,\n\nYou have successfully logged in at ${timeDate}\n\nBest regards.`
                    }
                }
            }
        };
    
    
        try {
            await ses.sendEmail(emailParams).promise();
            console.log('Email sent successfully');
        }
        catch (error) {
            console.error('Error sending email:', error);
        }
    }
    /*************************************postAuthenticationLambda*************************************/


    return event;
}