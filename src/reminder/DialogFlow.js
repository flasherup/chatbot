'use strict';
const projectId = 'chatbot-aroqai';
const sessionId = '123456';
const dialogFlow = require('dialogflow');
const languageCode = 'en-US';

const config = {
    credentials: {
        private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
        client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
    }
};

class DialogFlow {
    constructor(sessionClient) {
        this.sessionClient = sessionClient;
    }

    message(msg) {
        const sessionPath = this.sessionClient.sessionPath(projectId, sessionId);
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: msg,
                    languageCode: languageCode,
                },
            },
        };

        const processMessage = (resolve, reject) => {
            this.sessionClient
            .detectIntent(request)
            .then(responses => {
                if (responses.length === 0 || !responses[0].queryResult) {
                    reject(new Error('incorrect Dialog Flow answer'));
                } else {
                    resolve(responses[0].queryResult);
                }
            })
            .catch(err => {
                console.error('ERROR:', err);
                reject(err);
            });
        }
        return new Promise(processMessage);
    }
}

module.exports = () => {
    const sessionClient = new dialogFlow.SessionsClient(config);
    return new DialogFlow(sessionClient);
}

exports.DialogFlow = DialogFlow;