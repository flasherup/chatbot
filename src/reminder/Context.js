'use strict';
const ctxConstants = require('./constants');
const Remind = require('./Remind');

module.exports = class Context {
   constructor() {
      this.reset();
   }

   collectRemindText(text) {
      this.remind.setText(text);
   }

   collectRemindDate(date) {
      this.remind.setDate(date);
   }

   getCollectedRemind() {
      return this.remind;
   }

   //States
   setState(state) {
      this.state = state;
   }

   reset() {
      this.resetState();
      this.resetRemind();
   }

   resetState() {
      this.state = null;
   }

   resetRemind() {
      this.remind = new Remind(null);
   }

   isInitialState() {
      return this.state === null;
   }

   isWaitForTextState() {
      return this.state === ctxConstants.CTX_WAIT_FOR_REMIND_TEXT;
   }

   isWaitForTimeState() {
      return this.state === ctxConstants.CTX_WAIT_FOR_REMIND_TIME;
   }
};