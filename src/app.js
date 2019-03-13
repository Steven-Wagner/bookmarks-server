require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {NODE_ENV} = require('./config');
const logger = require('./logger');
const bookmarksRouter = require('./bookmarks/bookmark')

const app = express();

const morganSetting = (NODE_ENV === 'production')
    ? 'tiny'
    : 'dev';

app.use(cors())
app.use(morgan(morganSetting));
app.use(helmet());

app.use(function validateKey(req, res, next){
    const apiToken = process.env.API_TOKEN;
    const toValidateKey = req.get('authorization').split(' ')[1]

    if (!toValidateKey || toValidateKey !== apiToken) {
        logger.error(`unauthorized request to ${req.path} path`);
        return res
            .status(401)
            .json({error: 'unauthorized request'})
    }
    next();
})

app.use('/api/bookmarks', bookmarksRouter)

app.get('/', (req, res) => {
    res.send('Hello, world')
})

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = {error: {message: 'server error'}}
    }
    else {
        response = {error}
    }
    console.log(response)
    res.status(500).json(response)
})

    module.exports = app;