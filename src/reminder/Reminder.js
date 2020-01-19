module.exports = class Reminder {
    constructor(raw) {
        if (raw == null) {
            this.id = Math.round(Math.random()*1000000000);
            this.date = null;
            this.text = null;
            return;
        }
        this.id = raw.id;
        this.date = new Date(raw.date);
        this.text = raw.text;
    }
}