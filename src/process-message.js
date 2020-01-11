const fetch = require('node-fetch');

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

// Remember the Page Access Token you got from Facebook earlier?
// Don't forget to add it to your `variables.env` file.
const { FACEBOOK_ACCESS_TOKEN } = process.env;

const sendJsonMessage = (userId) => {
  return fetch(
    `https://graph.facebook.com/v2.6/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        recipient:{
          id:userId
        },
        message:{
          attachment:{
            type:'template',
            payload:{
              template_type:'generic',
              elements:[
                 {
                  title:'Welcome!',
                  image_url:'https://petersfancybrownhats.com/company_image.png',
                  subtitle:'We have the right hat for everyone.',
                  default_action: {
                    type: 'web_url',
                    url: 'https://petersfancybrownhats.com/view?item=103',
                    webview_height_ratio: 'tall',
                  },
                  buttons:[
                    {
                      type:'web_url',
                      url:'https://petersfancybrownhats.com',
                      title:'View Website'
                    },{
                      type:'postback',
                      title:'Start Chatting',
                      payload:'DEVELOPER_DEFINED_PAYLOAD'
                    }              
                  ]      
                }
              ]
            }
          }
        }
      }),
    }
  );
}

const sendTextMessage = (userId, text) => {
  return fetch(
    `https://graph.facebook.com/v2.6/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        messaging_type: 'RESPONSE',
        recipient: {
          id: userId,
        },
        message: {
          text,
        },
      }),
    }
  );
}


module.exports = (event) => {
  const userId = event.sender.id;
  const message = event.message.text;

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
      if (result.action === 'reminders_list') {
         return sendJsonMessage(userId);
      }
      return sendTextMessage(userId, result.fulfillmentText);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}
