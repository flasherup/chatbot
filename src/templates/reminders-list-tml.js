'use strict';
const constants = require('./constants');
const { dateToString } = require('../reminder/utils/date-utils');
const generateTemplateList = reminders => {
    console.log('reminders', reminders)
    if (!reminders) {
        console.log('no reminders', reminders)
        return [{
            title: 'No reminders found!'
        }];
    }
    return reminders.map(
        el => {
            console.log('el', el);
            return {
                title: el.text,
                subtitle: dateToString(el.date),
                buttons: [
                    {
                        type: 'postback',
                        title: 'Delete',
                        payload: constants.DELETE_PREFIX + el.id
                    },
                ]
            };
        }
    )
}
module.exports = (userId, reminders) => {
    const rem = generateTemplateList(reminders);
    console.log(rem);
    return {
        recipient: {
            id: userId
        },
        message: {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: rem
                }
            }
        }
    }
}