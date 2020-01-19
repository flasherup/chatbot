const Context = require('../src/reminder/Context');
const constants = require('../src/reminder/constants');

describe('Context Test', () => {
    const context = new Context();
    const testDate = '2020-01-20T12:01:00+02:00';
    const testText = 'test';
    test('isInitialState ok', () => {
        expect(context.isInitialState()).toBeTruthy();
    });

    test('setSate works ok', () => {
        context.setState(constants.CTX_WAIT_FOR_REMINDER_TEXT);
        expect(context.state).toBe(constants.CTX_WAIT_FOR_REMINDER_TEXT);
    });

    test('isWaitForDateState ok', () => {
        context.setState(constants.CTX_WAIT_FOR_REMINDER_DATE);
        expect(context.isWaitForDateState()).toBeTruthy();
    });

    test('isWaitForTextState ok', () => {
        context.setState(constants.CTX_WAIT_FOR_REMINDER_TEXT);
        expect(context.isWaitForTextState()).toBeTruthy();
    });

    test('is reminder created by default', () => {
        expect(context.getCollectedReminder()).toBeTruthy();
    });

    test('is collectReminderText works ok', () => {
        context.collectReminderText(testText);
        expect(context.reminder.text).toBe(testText);
    });

    test('is collectReminderDate works ok', () => {
        context.collectReminderDate(testDate);
        const resDate = new Date(testDate);
        expect(context.reminder.date.getTime()).toBe(resDate.getTime());
    });

    test('is reset works ok', () => {
        context.collectReminderDate(testDate);
        context.collectReminderText(testText);
        context.reset();
        expect(context.reminder.text === null 
            && context.reminder.date === null).toBeTruthy();
    });
})