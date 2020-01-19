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
                            title: 'We can not recognize time or date.',
                            subtitle: 'Please specify time in different way',
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