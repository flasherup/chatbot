'use strict';
module.exports = (userId, text) =>  {
    return {
        messaging_type: 'RESPONSE',
        recipient: {
          id: userId,
        },
        message: {
          text,
        },
      }
}