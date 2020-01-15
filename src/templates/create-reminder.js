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
                            title: 'Remind creation',
                            subtitle: 'Type your remind text',
                            buttons: [
                                {
                                    type: 'postback',
                                    title: 'Cancel',
                                    payload: constants.CANCEL
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
}