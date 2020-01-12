const fetch = require('node-fetch');
const simmpleResponse = require('./templates/simple-response')
const getStartedTemplate = require('./templates/get-sterted')

// You can find your project ID in your Dialogflow agent settings
const projectId = 'chatbot-aroqai'; //https://dialogflow.com/docs/agents#settings
const sessionId = '123456';
const languageCode = 'en-US';

const dialogflow = require('dialogflow');

const config = {
    credentials: {
        private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
        client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
    }
};

const sessionClient = new dialogflow.SessionsClient(config);
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const { FACEBOOK_ACCESS_TOKEN } = process.env;

const sendMessage = (generic) => {
    return fetch(
        `https://graph.facebook.com/v2.6/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(generic),
        }
    );
}

module.exports = (event) => {
    const userId = event.sender.id;
    const message = event.message.text;
    const postback = event.postback;
    console.log("postback", postback)

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
            const result = responses[0].queryResult;
            console.log("action", result.action)
            let response;
            if (result.action === 'reminders_list') {
                response = getStartedTemplate(userId)
            } else {
                response = simmpleResponse(userId, result.fulfillmentText)
            }
            return sendMessage(response);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
}
