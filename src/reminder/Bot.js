'use strict';
const Context = require('./Context');
const tmlConstants = require('../templates/constants');
const rmdConstants = require('./constants');
const pbUtils = require('./utils/post-back-utils')

const simpleResponseTml = require('../templates/simple-response-tml');
const getStartedTml = require('../templates/get-started-tml');
const remindersListTml = require('../templates/reminders-list-tml');
const remindersEmptyTml = require('../templates/reminders-empty-tml');
const reminderCreateTml = require('../templates/reminder-create-tml');
const reminderTimeTml = require('../templates/reminder-time-tml');
const reminderTimeRetryTml = require('../templates/reminder-time-retry-tml');
const remindSavedTml = require('../templates/reminder-saved-tml');
const reminderAlert = require('../templates/reminder-alert-tml');
const deleteCompleteTml = require('../templates/delete-complete-tml');

module.exports = class Bot {
    constructor(userId, store, dialogFlow) {
        this.userId = userId;
        this.context = new Context();
        this.store = store;
        this.dialogFlow = dialogFlow;
        if (!this.store.hasUser(this.userId))
            this.store.createUser(this.userId)
    }

    //Return all reminders that ready to fire
    //or empty array
    getReadyReminders() {
        const rem = this.store.getReminders(this.userId);
        const curDate = new Date();
        let res = [];
        let el;
        for (let i=0; i<rem.length; i++) {
            el = rem[i]
            if (el.date < curDate) {
                res.push(reminderAlert(this.userId, el));
            }
        }
        return res;
    }

    //Trying to read a message or postBack from event
    //return promise which will resolve with message template 
    processEvent(event) {
        const userId = event.sender.id;
        if (event.message && event.message.text) {
            return this.processMessage(event.message.text);
        } 
        if (event.postback && event.postback.payload) {
            return this.processPostBack(event.postback.payload);
        } 
        return new Promise((_, reject) => {
            reject(new Error(`can not process event, invalid event:${ event }`));
        });
    }

    //Process messages 
    //return promise which will resolve with message template
    processMessage(message) {
        if (this.context.isInitialState()) {
            return this._checkUserInputForCommand(message);
        }

        if (this.context.isWaitForTextState()) {
            return this._saveReminderMessage(message);
        }

        if (this.context.isWaitForDateState()) {
            return this._recognizeAndSaveReminderDate(message);
        }

        return new Promise((_,reject) => { 
            reject(new Error('Massage process error, state not found.'));
        });
    }

    //Process postbaks
    //return promise which will resolve with message template
    processPostBack(postBack) {
        return new Promise((resolve, reject) => {
            if (postBack === tmlConstants.SHOW_REMINDERS) {
                resolve(this._getReminderListTemplate());
                return;
            }
    
            if (postBack === tmlConstants.CREATE_REMINDER) {
                this.context.setState(rmdConstants.CTX_WAIT_FOR_REMINDER_TEXT);
                resolve(reminderCreateTml(this.userId));
                return;
            }
    
            if (postBack === tmlConstants.CANCEL) {
                if (this.context.isInitialState()) {
                    reject(new Error('Nothing to cancel'))
                }
                this.context.reset();
                resolve(simpleResponseTml(this.userId, 'Remind creation canceled'));
                return;
            }
    
            if (pbUtils.isDeletePostBack(postBack)) {
                const id = pbUtils.extractId(postBack);
                if (id != -1) {
                    const reminder = this.store.deleteReminder(this.userId, id);
                    if (reminder)resolve(deleteCompleteTml(this.userId, reminder));
                } 
                else reject(new Error('Id not recognized.'))
                return;
            }
    
            if (pbUtils.isConfirmPostBack(postBack)) {
                const id = pbUtils.extractId(postBack);
                if (id != -1) {
                    this.store.deleteReminder(this.userId, id);
                    resolve(null);
                }
                else reject(new Error('Id not recognized.'));
                return;
            }
    
            if (pbUtils.isSnoozePostBack(postBack)) {
                const id = pbUtils.extractId(postBack);
                if (id != -1) {
                    this.snoozeReminder(id);
                    resolve(null);
                } else reject(new Error('Id not recognized.'));
                return;
            }
            reject(new Error('postBack not recognized'))
        });
    }

    //Snooze reminder
    //delete old and create new one 
    //with the same time + rmdConstants.SNOOZE_TIME
    snoozeReminder(id) {
        const rem = this.store.deleteReminder(this.userId, id);
        if (!rem) {
            return;
        }
        const d = rem.date;
        d.setMinutes(d.getMinutes() + rmdConstants.SNOOZE_TIME);
        rem.date = d;
        this.store.addReminder(this.userId, rem)
    }

    //Sends message to Dialog Flow
    //and che the response
    //if command detected
    //than resolve promise with template message
    _checkUserInputForCommand(message) {
        return new Promise((resolve, reject) => {
            this.dialogFlow.message(message)
                .then((queryResult) => {
                        if (queryResult.action === rmdConstants.DF_GET_STARTED) {
                            resolve(getStartedTml(this.userId));
                            return;
                        }
                        if (queryResult.action === rmdConstants.DF_REMINDERS_LIST) {
                            resolve(this._getReminderListTemplate());
                            return;
                        }
                        if (queryResult.action === rmdConstants.DF_REMINDER_CREATE) {
                            this.context.setState(rmdConstants.CTX_WAIT_FOR_REMINDER_TEXT);
                            resolve(reminderCreateTml(this.userId));
                            return;
                        }
                        resolve(simpleResponseTml(this.userId, queryResult.fulfillmentText));
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    //Save message
    //and resolve promise with Time input template
    _saveReminderMessage(message) {
        return new Promise((resolve) => {
            this.context.collectReminderText(message);
            this.context.setState(rmdConstants.CTX_WAIT_FOR_REMINDER_DATE);
            resolve(reminderTimeTml((this.userId)));
        });
    }

    //Trying to recognize time and date
    //In success save reminder and resolve promise with success message
    //In false resolve promise with retry message 
    _recognizeAndSaveReminderDate(message) {
        return new Promise((resolve, reject) => {
            this.dialogFlow.message(message)
                .then((queryResult) => {
                if (queryResult && queryResult.allRequiredParamsPresent) {
                    const date = pbUtils.parseTimeAndDate(queryResult)
                    if (date !== pbUtils.TIME_IS_NOT_RECOGNIZED) {
                        this.context.collectReminderDate(date);
                        const reminder = this.context.getCollectedReminder();
                        this.store.addReminder(this.userId, reminder);
                        this.context.reset();
                        resolve(remindSavedTml(this.userId, reminder));
                    } else {
                        resolve(reminderTimeRetryTml((this.userId)));
                    }
                } else {
                    reject(new Error('can not parse time'));
                }
                
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    //Return message template with reminders list
    //If there is no any reminders, send message about lack of reminders
    _getReminderListTemplate() {
        const reminders = this.store.getReminders(this.userId);
        if (!reminders || reminders.length == 0) {
            return remindersEmptyTml(this.userId);
        } else {
            return remindersListTml(this.userId, reminders);
        }
    }
}