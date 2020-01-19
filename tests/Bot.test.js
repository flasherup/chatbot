require('dotenv').config({ path: 'variables.env' });
const { RemindersStore } = require('../src/reminder/RemindersStore');
const Bot = require('../src/reminder/Bot');
const Reminder = require('../src/reminder/Reminder')
const dialogFlow = require('../src/reminder/DialogFlow')();

const tmlConstants = require('../src/templates/constants');
const getStartedTml = require('../src/templates/get-started-tml');
const reminderCreateTml = require('../src/templates/reminder-create-tml');
const reminderTimeTml = require('../src/templates/reminder-time-tml');
const reminderSavedTml = require('../src/templates/reminder-saved-tml');
const deleteCompleteTml = require('../src/templates/delete-complete-tml');

describe('Bot Test', () => {
    const store = new RemindersStore(
        'Test Bot Store',
        { path: process.cwd() + '/tests/src/botTest.json' }
    );

    const userId = '1000';
    store.createUser(userId);
    const bot = new Bot(userId, store, dialogFlow);
    const srcText = 'reminder creation text';
    const srcDate = '20-01-2020';
    const resDate = '2020-01-20T10:00:00.000Z';

    test('test event: hi bot', () => {
        const resp = getStartedTml(userId);
        const event = createMessageEvent(userId, 'hi bot');
        return expect(bot.processEvent(event)).resolves.toStrictEqual(resp);
    });

    describe('Bot Test: Create/Delete reminder', () => {
        test(`test start creation`, () => {
            const resp = reminderCreateTml(userId);
            const event = createPostBackEvent(userId, tmlConstants.CREATE_REMINDER);
            return expect(bot.processEvent(event)).resolves.toStrictEqual(resp);
        });

        test(`test add reminder text`, () => {
            const resp = reminderTimeTml(userId);
            const event = createMessageEvent(userId, srcText);
            return expect(bot.processEvent(event)).resolves.toStrictEqual(resp);
        });

        test(`test add reminder time`, () => {
            const reminder = new Reminder();
            reminder.text = srcText;
            reminder.date = new Date(resDate);
            const resp = reminderSavedTml(userId, reminder);
            const event = createMessageEvent(userId, srcDate);
            return expect(bot.processEvent(event)).resolves.toStrictEqual(resp);
        });

        const reminders = store.getReminders(userId);
        reminders.forEach(reminder => {
            test(`test delete reminder ${ reminder.id }`, () => {
                const resp = deleteCompleteTml(userId, reminder);
                const event = createPostBackEvent(userId, `${ tmlConstants.DELETE_PREFIX }${ reminder.id }`);
                return expect(bot.processEvent(event)).resolves.toStrictEqual(resp);
            });
        });
    });
});

const createMessageEvent = (userId, text) => {
    return {
        sender: { id: userId },
        message: { text: text }
    };
};

const createPostBackEvent = (userId,postBack) => {
    return {
        sender: { id: userId },
        postback: { payload: postBack }
    };
};