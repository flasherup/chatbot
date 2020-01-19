const Reminder = require('../src/reminder/Reminder');

const rawTest = {reminders: [
    {
        id: 1,
        date: '2020-01-20T12:01:00+02:00',
        text: 'User 1, Reminder 1'
    }
]}

const isReminderOk = reminder => {
    if (!reminder) {
        throw new Error('Reminder is invalid.');
    }
    return true;
}

describe('Reminder Test', () => {
    const reminder = new Reminder(rawTest);
    test('Reminder initialize from raw data', () => {
        expect(isReminderOk(reminder)).toBeTruthy();
    });

    test('Reminder id parsed ok', () => {
        expect(reminder.id).toBe(rawTest.id);
    });

    test('Reminder text parsed ok', () => {
        expect(reminder.text).toBe(rawTest.text);
    });

    const testDate = new Date(rawTest.date);
    test('Reminder data parsed ok', () => {
        expect(reminder.date.getTime()).toBe(testDate.getTime());
    });
})