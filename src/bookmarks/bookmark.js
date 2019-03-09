const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const {bookmarks} = require('../bookmarks.fixtures');
const BookmarksService = require('../bookmarks-service')

const bookmarksRouter = express.Router();
const bodyParser = express.json();


bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks)
            })
        .catch(next)
    })
    .post(bodyParser, (req, res) => {
        const {title, url, rating = 3, desc} = req.body;

        if (!title) {
            logger.error(`requires title at path ${req.path}`)
            return res
                .status(400)
                .send('Requires title');
        }
        if (!url) {
            logger.error(`requires url at path ${req.path}`)
            return res
                .status(400)
                .send('Requires url');
        }
        if (!desc) {
            logger.error(`requires description at path ${req.path}`)
            return res
                .status(400)
                .send('Requires description');
        }

        if (parseInt(rating) < 0 && parseInt(rating) > 5) {
            logger.error(`Rating must be 0-5 at ${req.path}`)
            return res
                .status(400)
                .send('Invalid rating');
        }

        const id = uuid();

        const bookmark = {
            id,
            title,
            rating,
            desc
        }

        bookmarks.push(bookmark);

        res
            .status(201)
            .location(`http://localhost:8000/card/${id}`)
            .json(bookmark)
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        const {id} = req.params;

        BookmarksService.getBookmarkById(knexInstance, id)
            .then(book => {
                if (!book) {
                    logger.error(`id ${id} can not be located`)
                    return res
                        .status(404)
                        .send('No id found')
                }
                res
                    .json(book)
            })
            .catch(next);
    })
    .delete((req, res) => {
        const {id} = req.params;

        const bookIndex = bookmarks.findIndex(bookmark => {
            return bookmark.id == id
        })

        if (bookIndex === -1) {
            logger.error(`id ${id} can not be located`)
            return res
                .status(404)
                .send('No id found')
        }

        bookmarks.splice(bookIndex, 1);

        logger.info(`bookmark with id ${id} has been deleted`);
        res
            .status(204)
            .end()
    })

module.exports = bookmarksRouter;