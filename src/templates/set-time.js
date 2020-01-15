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
                            title: 'Remind creation step 2',
                            subtitle: 'Specify a date/time',
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