'use strict';
const Context = require('./Context');
const Remind = require('./Remind');
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
            this.processPostback(event.postback.payload, onResponseReady);
            return;
        } 

        onResponseReady(this.errorMessage(userId));
    }

    processMessage(message, callBack) {
        console.log('processMessage')
        if (this.context.isInitialState()) {
            console.log('InitialState')
            const onAnswerReady = (queryResult) => {
                console.log('onAnswerReady', queryResult)
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
            this.context.collectRemindText(message)
            this.context.setState(ctxConstants.CTX_WAIT_FOR_REMIND_TIME);

            callBack(setTimeTml((this.userId)))
            return;
        }

        if (this.context.isWaitForTimeState()) {
            console.log('WaitForTimeState')
            this.context.collectRemindDate(message)
            this.collectRemind(this.context.getCollectedRemind())
            this.context.reset();
            callBack(remindSavedTml((this.userId)))
            return;
        }

        console.log('state not found')
    }

    processPostback(postback, callBack) {
        console.log('postback', postback, this.userId);
        if (postback === constants.SHOW_REMINDERS) {
            callBack(listOfRemindersTml(this.userId, this.getReminders()));
            return;
        }

        if (postback === constants.CREATE_REMINDER) {
            this.context.setState(ctxConstants.CTX_WAIT_FOR_REMIND_TEXT);
            callBack(createReminderTml(this.userId));
            return;
        }

        if (postback === constants.CANCEL) {
            this.context.reset();
            callBack(simpleResponseTml(this.userId, 'Remind creation canceled'));
            return;
        }

        if (isDeletePostBack(postback)) {
            const index = getDeleteIndex(postback);
            console.log('Delete: ',index);
        }

        callBack(simpleResponseTml(this.userId, "postback not recognised"))
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

    getReminders() {
        const raws = this.store.get(this.userId).reminders;
        if (!raws) {
            console.log('cant get stored reminders')
        }
        return raws.map(el => new Remind(el));
    }
}

const isDeletePostBack = postBack => {
    return (postBack.indexOf(constants.DELETE_PREFIX) != -1);
};

const getDeleteIndex = postBack => {
    const s = postBack.split(':');
    if (s.length < 2) return -1;
    const index = parseInt(s[1]);
    if (isNaN(index)) return -1;
    return index;
};