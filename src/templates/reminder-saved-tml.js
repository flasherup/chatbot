'use strict';
const constants = require('./constants');
const { dateToString } = require('../reminder/utils/date-utils');
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
                            title: 'Your reminder saved',
                            subtitle: `${ dateToString(reminder.date) }, ${ reminder.text }`,
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