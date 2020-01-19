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
                            title: 'Something goes wrong',
                            subtitle: 'The reminder you are looking for is not exist.',
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