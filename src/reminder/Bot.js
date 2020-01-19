'use strict';
const Context = require('./Context');
const tmlConstants = require('../templates/constants');
const ctxConstants = require('./constants');
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

    processMessage(message) {
        console.log('processMessage')
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

    processPostBack(postBack) {
        console.log('postBack', postBack, this.userId);
        return new Promise((resolve, reject) => {
            if (postBack === tmlConstants.SHOW_REMINDERS) {
                resolve(resolve(this._getReminderListTemplate()));
                return;
            }
    
            if (postBack === tmlConstants.CREATE_REMINDER) {
                this.context.setState(ctxConstants.CTX_WAIT_FOR_REMINDER_TEXT);
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
                    resolve(deleteCompleteTml(this.userId, reminder));
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

    errorMessage() { 
        return simpleResponseTml(this.userId, 'Something goes wrong :(, try again pleas');
    }

    snoozeReminder(id) {
        const rem = this.store.deleteReminder(this.userId, id);
        if (!rem) {
            return;
        }
        const d = rem.date;
        d.setMinutes(d.getMinutes() + ctxConstants.SNOOZE_TIME);
        rem.date = d;
        this.store.addReminder(this.userId, rem)
    }

    _checkUserInputForCommand(message) {
        return new Promise((resolve, reject) => {
            this.dialogFlow.message(message)
                .then((queryResult) => {
                        if (queryResult.action === 'reminders_list') {
                                resolve(this._getReminderListTemplate());
                            return;
                        }
                        if (queryResult.action === 'get_started') {
                            resolve(getStartedTml(this.userId));
                            return;
                        }
                        resolve(simpleResponseTml(this.userId, queryResult.fulfillmentText));
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    _saveReminderMessage(message) {
        return new Promise((resolve) => {
            this.context.collectReminderText(message);
            this.context.setState(ctxConstants.CTX_WAIT_FOR_REMINDER_DATE);
            resolve(reminderTimeTml((this.userId)));
        });
    }

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

    _getReminderListTemplate() {
        const reminders = this.store.getReminders(this.userId);
        if (!reminders || reminders.length == 0) {
            return remindersEmptyTml(this.userId);
        } else {
            return remindersListTml(this.userId, reminders);
        }
    }
}