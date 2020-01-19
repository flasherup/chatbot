'use strict';

const { Store } = require('data-store');
const Reminder = require('./Reminder');

class RemindersStore {
    constructor(name, options = {}, defaults = {}) {
        this.store = new Store(name, options, defaults);
        const stored = this.store.get();
        this.data = this.convertToReminders(stored)
    }

    convertToReminders(data) {
        const result = {};
        for (const key in data) {
            result[key] = { reminders: data[key].reminders.map(
                rem => {
                    return  new Reminder(rem);
                }
            )};
        }
        return result;
    }

    hasUser(userId) {
        const result = this.data[userId];
        if (!result) return false;
        return true
    }

    getReminders(userId) {
        return this.data[userId].reminders;
    }

    addReminder(userId, reminder) {
        if (!this.hasUser(userId)) {
            this.createUser(userId);
        }

        if (!reminder || !reminder instanceof Reminder) {
            throw new Error (`Reminder not added, reminder:${ reminder } is invalid`);
        } 

        this.data[userId].reminders.push(reminder);
        this.store.set(userId, this.data[userId]);
    }

    deleteReminder(userId, reminderId) {
        if (!this.hasUser(userId)) {
            throw new Error (`Reminder delete error, user:${ userId } not exist`);
        }

        const storedRem = this.getReminders(userId);
        const res = storedRem.find(item => item.id === reminderId);
        let reminders = storedRem.filter(item => item.id !== reminderId);

        this.data[userId].reminders = reminders;
        this.store.set(userId, this.data[userId]);
        return res;
    }

    deleteUser(userId) {
        this.data[userId] = null;
        this.store.del(userId);
    }

    createUser(userId) {
        if (this.hasUser(userId))  {
            console.warn(`User:${ userId } already exist`);
            return;
        }
        this.data[userId] = { reminders:[] };
    }
}

module.exports = function (...args) {
    return new RemindersStore(...args);
};

module.exports.RemindersStore = RemindersStore;