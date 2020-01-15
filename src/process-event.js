'use strict';
const store = require('data-store')({ path: process.cwd() + '/reminders.json' });
const sendMessage = require('./send-message')
const Bot = require('./reminder/Bot')


const bots = {}

module.exports = (event) => {
    console.log('process event', event);
    const userId = event.sender.id;

    if (!bots[userId]) bots[userId] = new Bot(userId, store)
    
    bots[userId].processEvent(event, sendMessage)
}
