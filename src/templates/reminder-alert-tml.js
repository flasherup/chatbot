'use strict';
const constants = require('./constants')
module.exports = (userId, reminder) => {
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
                            title: reminder.text,
                            subtitle: reminder.date.toDateString(),
                            buttons: [
                                {
                                    type: 'postback',
                                    title: 'Confirm',
                                    payload: constants.CONFIRM_PREFIX + reminder.id
                                },
                                {
                                    type: 'postback',
                                    title: 'Snooze',
                                    payload: constants.SNOOZE_PREFIX + reminder.id
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
}