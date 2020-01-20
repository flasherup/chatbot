'use strict';
const store = require('./reminder/RemindersStore')({ path: process.cwd() + '/reminders.json' });
const sendMessage = require('./send-message')
const Bot = require('./reminder/Bot')
const dialogFlow = require('./reminder/DialogFlow')();

class BotManager {
    constructor(updateInterval) {
        this.updateInterval = updateInterval;
        this.bots = this._restoreBots(store, dialogFlow);
        this.checkIntervalId = this.startRemindersCheck(this.updateInterval);
        this._checkReminders();
    }

    //Process message event with from chat
    //and send reply if needed
    //Create new bot in case of new user
    processMessengerEvent(event) {
        const userId = event.sender.id;
        if (!this.bots[userId]) this.bots[userId] = new Bot(userId, store, dialogFlow)
        
        this.bots[userId].processEvent(event).then(resp => {
            if (resp) sendMessage(resp);
        }).catch( err => {
            console.log('can not process event', err)
        });
    }

    startRemindersCheck(interval) {
        return setInterval(() => { this._checkReminders() }, interval);
    }

    stopRemindersCheck() {
        clearInterval(this.checkIntervalId)
    }

    //Restore all reminders saved in store
    _restoreBots(store, dialogFlow) {
        let bots = {};
        const keys = store.data;
        for (let key in keys) {
            console.log(key);
            bots[key] = new Bot(key, store, dialogFlow)
        }
        return bots;
    }

    //Check if any reminder ready for alert
    //And if it is ready, than fire reminder
    _checkReminders() {
        console.log('checkReminders');
        let reminders = [];
        for (let key in this.bots) {
            reminders = this.bots[key].getReadyReminders();
            console.log('bot', key, 'reminders', reminders);
            reminders.forEach(r => {
                sendMessage(r);
            });
        }
    }
}

module.exports = BotManager;
