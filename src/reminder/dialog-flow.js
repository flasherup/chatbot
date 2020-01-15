'use strict';
const projectId = 'chatbot-aroqai';
const sessionId = '123456';
const dialogflow = require('dialogflow');
const languageCode = 'en-US';

const config = {
    credentials: {
        private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
        client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
    }
};

const sessionClient = new dialogflow.SessionsClient(config);

module.exports = (message, onAnsverReady) => {
    console.log("message", message)
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: languageCode,
            },
        },
    };

    sessionClient
        .detectIntent(request)
        .then(responses => {
            if (responses.length === 0) {
                onAnsverReady(null)
            } else {
                onAnsverReady(responses[0].queryResult);
            }
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
}