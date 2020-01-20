'use strict';
require('dotenv').config({ path: 'variables.env' })
const express = require('express');
const bodyParser = require('body-parser');
const BotManager = require('./BotManager')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(5000, () => console.log('Express server is listening on port 5000'));

const verifyWebhook = require('./verify-webhook');
app.get('/', verifyWebhook);

const updateInterval = 30 * 1000;
const botManager = new BotManager(updateInterval)

app.post('/', (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                botManager.processMessengerEvent(event);
            });
        });

        res.status(200).end();
    }
});