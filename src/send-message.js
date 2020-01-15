'use strict';
const { FACEBOOK_ACCESS_TOKEN } = process.env;
const fetch = require('node-fetch');

module.exports = (generic) => {
    return fetch(
        `https://graph.facebook.com/v2.6/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(generic),
        }
    )
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error(err));
}