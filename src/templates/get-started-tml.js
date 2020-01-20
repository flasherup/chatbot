'use strict';
const constants = require('./constants')
module.exports = (userId) => {
    return {
        recipient: {
            id: userId
        },
        message: {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: [
                        {
                            title: 'Hello, I am chat bot!',
                            subtitle: 'What can I do for you?',
                            buttons: [
                                {
                                    type: 'postback',
                                    title: 'Show my reminders',
                                    payload: constants.SHOW_REMINDERS
                                },{
                                    type: 'postback',
                                    title: 'Add reminder',
                                    payload: constants.CREATE_REMINDER
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
}