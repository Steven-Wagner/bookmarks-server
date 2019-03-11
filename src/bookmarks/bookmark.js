const express = require('express');
const logger = require('../logger');
const {bookmarks} = require('../bookmarks.fixtures');
const BookmarksService = require('../bookmarks-service')
const xss = require('xss');

const bookmarksRouter = express.Router();
const bodyParser = express.json();


const serializeBookmarks = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: xss(bookmark.url),
    rating: bookmark.rating,
    description: xss(bookmark.description)
})

bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmarks))
            })
        .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const {title, url, rating = 3, description} = req.body;
        console.log('post is being called', title)

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
        if (!description) {
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

        const bookmark = {
            title,
            url,
            rating,
            description
        }
        BookmarksService.postNewBookmark(
            req.app.get('db'),
            bookmark
        )
        .then(response => {
            res
                .status(201)
                .location(`http://localhost:8000/card/${response.id}`)
                .json(serializeBookmarks(response))
            })
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
                    .json(serializeBookmarks(book))
            })
            .catch(next);
    })
    .delete((req, res, next) => {
        const {id} = req.params;

        BookmarksService.deleteArticle(
            req.app.get('db'),
            id
        )
        .then((response) => {
            logger.info(`bookmark with id ${id} has been deleted`);
            if (!response) {
                return res.status(404).send({error: {message: 'id does not exist'}})
            }
            res.status(204).end()
        })
        .catch(next)

        // if (bookIndex === -1) {
        //     logger.error(`id ${id} can not be located`)
        //     return res
        //         .status(404)
        //         .send('No id found')
        // }
    })

module.exports = bookmarksRouter;