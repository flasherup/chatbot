const { RemindersStore } = require('../src/reminder/RemindersStore');
const Reminder = require('../src/reminder/Reminder');

const isStoredDataOk = data => {
    if (!data) {
        throw new Error('Restored data invalid.');
    }

    if (!data['1']) {
        throw new Error('User not found.');
    }

    if (!data['1'].reminders) {
        throw new Error('User has no reminders.');
    }

    if (data['1'].reminders.length != 2) {
        throw new Error('User has invalid number of reminders.');
    }

    if (!data['1'].reminders[0]) {
        throw new Error('User first reminder is invalid.');
    }

    if (data['1'].reminders[0].id !== 1) {
        throw new Error('User first reminder has invalid id.');
    }

    const testDate = new Date('2020-01-20T12:01:00+02:00');
    if (data['1'].reminders[0].date.getTime() !== testDate.getTime()) {
        throw new Error('User first reminder has invalid date.');
    }

    return true;
}

const userIdTest = '500';

const reminderTest = {
            id:100,
            text:'test text',
            date: '2020-01-20T13:01:00+02:00'
    }

describe('ReminderStore Test', () => {
    const rStore = new RemindersStore(
        'Test Store', 
        { path: process.cwd() +'/tests/src/remindersTest.json' }
    );
    test('is restore user successful', () => {
        expect(isStoredDataOk(rStore.data)).toBeTruthy();
    });

    const rwStore = new RemindersStore(
        'Test Read Write Store', 
        { path: process.cwd() +'/tests/src/remindersTempTest.json' }
    );

    test('is hasUser return false if user not exist', () => {
        expect(!rwStore.hasUser('600')).toBeTruthy();
    });

    test('is createUser works fine', () => {
        rwStore.createUser(userIdTest);
        expect(rwStore.data[userIdTest]).toStrictEqual({ reminders:[] });
    });

    const rem = new Reminder(reminderTest)
    test('is addReminder works fine', () => {
        rwStore.addReminder(userIdTest, rem);
        expect(rwStore.data[userIdTest].reminders[0]).toStrictEqual(rem);
    });

    test('is deleteReminder works fine', () => {
        rwStore.deleteReminder(userIdTest, rem.id);
        expect(rwStore.data[userIdTest].reminders.length).toBe(0);
    });

    test('is deleteUser works fine', () => {
        rwStore.deleteUser(userIdTest);
        expect(rwStore.data[userIdTest] == null).toBeTruthy();
    });
})