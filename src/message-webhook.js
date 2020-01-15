'use strict';
const processEvent = require('./process-event');

module.exports = (req, res) => {
    console.log('message-webhook')
    if (req.body.object === 'page') {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                processEvent(event);
            });
        });

        res.status(200).end();
    }
};