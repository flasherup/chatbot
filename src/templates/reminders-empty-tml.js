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
                            title: 'You don not have any reminders yet',
                            buttons: [
                                {
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