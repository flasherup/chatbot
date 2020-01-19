const tmlConstants = require('../../templates/constants');
const TIME_IS_NOT_RECOGNIZED = 'unrecognized';
exports.TIME_IS_NOT_RECOGNIZED = TIME_IS_NOT_RECOGNIZED;

exports.isDeletePostBack = postBack => {
    return (postBack.indexOf(tmlConstants.DELETE_PREFIX) != -1);
};

exports.isConfirmPostBack = postBack => {
    return (postBack.indexOf(tmlConstants.CONFIRM_PREFIX) != -1);
};

exports.isSnoozePostBack = postBack => {
    return (postBack.indexOf(tmlConstants.SNOOZE_PREFIX) != -1);
};

exports.extractId = postBack => {
    const s = postBack.split(':');
    if (s.length < 2) return -1;
    const index = parseInt(s[1]);
    if (isNaN(index)) return -1;
    return index;
};


exports.parseTimeAndDate = query => {
    console.log(query.parameters);
    const d = query.parameters.fields.date;
    if (d && d.stringValue !== '') {
        return d.stringValue;
    }

    const t = query.parameters.fields.time;
    if (t && t.stringValue !== '') {
        return t.stringValue;
    }

    const dt = query.parameters.fields['date-time'];
    if (dt && dt.structValue !== '' 
        && dt.structValue.fields 
        && dt.structValue.fields.date_time) {
        return dt.structValue.fields.date_time.stringValue;
    }
    
    return TIME_IS_NOT_RECOGNIZED
}