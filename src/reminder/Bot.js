'use strict';
const Context = require('./Context');
const Reminder = require('./Reminder');
const dialogFlow = require('./dialog-flow');
const constants = require('../templates/constants');
const ctxConstants = require('./constants');

const simpleResponseTml = require('../templates/simple-response');
const getStartedTml = require('../templates/get-started');
const listOfRemindersTml = require('../templates/reminders-list');
const createReminderTml = require('../templates/create-reminder');
const setTimeTml = require('../templates/set-time');
const remindSavedTml = require('../templates/remind-saved');


module.exports = class Bot {
    constructor(userId, store) {
        this.userId = userId;
        this.context = new Context();
        this.store = store;
        if (!this.store.has(this.userId))
            this.store.set(this.userId, {reminders:[]})
    }

    processEvent(event, onResponseReady) {
        const userId = event.sender.id;
        if (event.message && event.message.text) {
            this.processMessage(event.message.text, onResponseReady);
            return;
        } 

        if (event.postback && event.postback.payload) {
            this.processPostBack(event.postback.payload, onResponseReady);
            return;
        } 

        onResponseReady(this.errorMessage(userId));
    }

    processMessage(message, callBack) {
        console.log('processMessage')
        if (this.context.isInitialState()) {
            console.log('InitialState')
            const onAnswerReady = (queryResult) => {
                if (queryResult !== null) {
                    callBack(this.getTemplate(queryResult, this.userId));
                    return;
                }
                callBack(errorMessage(userId));
            }
            dialogFlow(message, onAnswerReady);
            return;
        }

        if (this.context.isWaitForTextState()) {
            console.log('WaitForTextState')
            this.context.collectReminderText(message)
            this.context.setState(ctxConstants.CTX_WAIT_FOR_REMINDER_DATE);

            callBack(setTimeTml((this.userId)))
            return;
        }

        if (this.context.isWaitForDateState()) {
            console.log('WaitForTimeState')
            const onAnswerReady = (queryResult) => {
                if (queryResult !== null && queryResult.allRequiredParamsPresent) {
                    const date = parseTimeAndDate(queryResult)
                    if (date != TIME_IS_NOT_RECOGNIZED) {
                        this.context.collectReminderDate(date)
                        this.collectRemind(this.context.getCollectedRemind())
                        this.context.reset();
                        callBack(remindSavedTml((this.userId)))
                        return;
                    }
                }
                callBack(setTimeTml((this.userId)));
            }
            dialogFlow(message, onAnswerReady);
            return;
        }

        console.log('state not found')
    }

    processPostBack(postBack, callBack) {
        console.log('postBack', postBack, this.userId);
        if (postBack === constants.SHOW_REMINDERS) {
            callBack(listOfRemindersTml(this.userId, this.getReminders()));
            return;
        }

        if (postBack === constants.CREATE_REMINDER) {
            this.context.setState(ctxConstants.CTX_WAIT_FOR_REMINDER_TEXT);
            callBack(createReminderTml(this.userId));
            return;
        }

        if (postBack === constants.CANCEL) {
            this.context.reset();
            callBack(simpleResponseTml(this.userId, 'Remind creation canceled'));
            return;
        }

        if (isDeletePostBack(postBack)) {
            const id = getDeleteId(postBack);
            if (id != -1) this.deleteRemind(id);
            console.log('Delete: ',id);
        }

        callBack(simpleResponseTml(this.userId, "postBack not recognized"))
    }

    errorMessage() { 
        return simpleResponseTml(this.userId, "Something goes wrong :(, try again pleas");
    }

    getTemplate(queryResult) {
        if (queryResult.action === 'reminders_list') {
            return listOfRemindersTml(this.userId, this.getReminders());
        } 

        if (queryResult.action === 'get_started') {
            return getStartedTml(this.userId);
        }

        return simpleResponseTml(this.userId, queryResult.fulfillmentText);
    }

    collectRemind(remind) {
        const storedRem = this.getReminders();
        let rem = [...storedRem, remind];
        rem.sort((a,b) => a.getJSDate() < b.getJSDate());

        const storedData = this.store.get(this.userId);
        const save = Object.assign({},storedData);
        save.reminders = rem;
        this.store.set(this.userId, save);
    }

    deleteRemind(id) {
        const storedRem = this.getReminders();
        let rem = storedRem.filter(item => item.getId() !== id)
        rem.sort((a,b) => a.getJSDate() < b.getJSDate());

        const storedData = this.store.get(this.userId);
        const save = Object.assign({},storedData);
        save.reminders = rem;
        this.store.set(this.userId, save);
    }

    getReminders() {
        const raws = this.store.get(this.userId).reminders;
        if (!raws) {
            console.log('cant get stored reminders')
        }
        return raws.map(el => new Reminder(el));
    }
}

const isDeletePostBack = postBack => {
    return (postBack.indexOf(constants.DELETE_PREFIX) != -1);
};

const getDeleteId = postBack => {
    const s = postBack.split(':');
    if (s.length < 2) return -1;
    const index = parseInt(s[1]);
    if (isNaN(index)) return -1;
    return index;
};

const TIME_IS_NOT_RECOGNIZED = 'unrecognized';
const parseTimeAndDate = query => {
    const d = query.parameters.fields.date;
    if (d && d.stringValue !== '') {
        return d.stringValue;
    }

    const t = queryResult.parameters.fields.time;
    if (t && t.stringValue !== '') {
        return t.stringValue;
    }
    
    return TIME_IS_NOT_RECOGNIZED
}