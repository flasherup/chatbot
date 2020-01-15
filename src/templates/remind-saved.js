'use strict';
const constants = require('./constants');
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
                            title: 'Remind creation complete',
                            subtitle: 'You remind saved',
                            buttons: [
                                {
                                    type: 'postback',
                                    title: 'Show my reminders',
                                    payload: constants.SHOW_REMINDERS
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
}