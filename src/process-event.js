'use strict';
const store = require('./reminder/RemindersStore')({ path: process.cwd() + '/reminders.json' });
const sendMessage = require('./send-message')
const Bot = require('./reminder/Bot')
const dialogFlow = require('./reminder/DialogFlow')();

const updateInterval = 30 * 1000;
const restoreBots = (store) => {
    let bots = {};
    const keys = store.data;
    for (let key in keys) {
        console.log(key);
        bots[key] = new Bot(key, store, dialogFlow)
    }
    return bots;
}

const checkReminders = () => {
    console.log('checkReminders');
    let reminders = [];
    for (let key in bots) {
        reminders = bots[key].getReadyReminders();
        console.log('bot', key, 'reminders', reminders);
        reminders.forEach(r => {
            sendMessage(r);
        });
    }
}

const bots = restoreBots(store);
setInterval(checkReminders, updateInterval);
checkReminders();

module.exports = (event) => {
    console.log('process event', event);
    const userId = event.sender.id;

    if (!bots[userId]) bots[userId] = new Bot(userId, store, dialogFlow)
    
    bots[userId].processEvent(event).then(resp => {
        sendMessage(resp);
    }).catch( err => {
        console.log('can not process event', err)
    });
}
