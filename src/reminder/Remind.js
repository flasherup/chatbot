module.exports = class Remind {
    constructor(raw) {
        if (raw == null) {
            this.id = Math.random()*1000000;
            return;
        }
        this.id = raw.id;
        this.date = raw.date;
        this.text = raw.text;
    }

    getId() {
        return this.id;
    }

    getDate() {
        return this.date;
    }

    getText() {
        return this.text;
    }

    setDate(date) {
        this.date = date;
    }

    setText(text) {
        this.text = text;
    }

    getJSDate() {
        return new Date(this.date);
    }
}