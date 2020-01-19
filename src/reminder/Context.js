'use strict';
const ctxConstants = require('./constants');
const Reminder = require('./Reminder');

module.exports = class Context {
   constructor() {
      this.reset();
   }

   collectReminderText(text) {
      this.reminder.text = text;
   }

   collectReminderDate(date) {
      this.reminder.date = new Date(date);
   }

   getCollectedReminder() {
      return this.reminder;
   }

   //States
   setState(state) {
      this.state = state;
   }

   reset() {
      this.resetState();
      this.resetReminder();
   }

   resetState() {
      this.state = null;
   }

   resetReminder() {
      this.reminder = new Reminder(null);
   }

   isInitialState() {
      return this.state === null;
   }

   isWaitForTextState() {
      return this.state === ctxConstants.CTX_WAIT_FOR_REMINDER_TEXT;
   }

   isWaitForDateState() {
      return this.state === ctxConstants.CTX_WAIT_FOR_REMINDER_DATE;
   }
};