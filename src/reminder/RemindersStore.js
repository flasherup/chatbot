'use strict';

const { Store } = require('data-store');
const Reminder = require('./Reminder');

//Store for reminders
class RemindersStore {
    constructor(name, options = {}, defaults = {}) {
        this.store = new Store(name, options, defaults);
        const stored = this.store.get();
        this.data = this.convertToReminders(stored)
    }

    //Convert data from JSON to Reminder type
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

    //Return true is user exist
    hasUser(userId) {
        const result = this.data[userId];
        if (!result) return false;
        return true
    }

    //Return all reminders 
    //fo specified @userId
    getReminders(userId) {
        return this.data[userId].reminders;
    }

    //Add @reminder for @userId
    //and store it
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

    //Remove reminder 
    //and update store 
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

    //Remove user with all his reminders
    deleteUser(userId) {
        this.data[userId] = null;
        this.store.del(userId);
    }

    //Create new user
    //Will do nothing in case if user already exist
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