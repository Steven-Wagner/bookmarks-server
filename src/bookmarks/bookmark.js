const express = require('express');
const logger = require('../logger');
const BookmarksService = require('../bookmarks-service')
const xss = require('xss');
const path = require('path')

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
    .route('/')
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
                .location(path.posix.join(req.originalUrl, `/${response.id}`))
                .json(serializeBookmarks(response))
        })
        .catch(next)
    })
    

bookmarksRouter
    .route('/:id')
    .all((req, res, next) => {
        BookmarksService.getBookmarkById(
            req.app.get('db'),
            req.params.id
        )
        .then(bookmark => {
            if (!bookmark) {
                return res.status(404).json({
                    error: { message: `id does not exist` }
                })
            }
            res.bookmark = bookmark
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeBookmarks(res.bookmark))
    })

    .delete((req, res, next) => {
        const {id} = req.params;

        BookmarksService.deleteBookmark(
            req.app.get('db'),
            id
        )
        .then((response) => {
            logger.info(`bookmark with id ${id} has been deleted`);
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const {title, description, rating, url} = req.body;
        const updatedInfo = {title, description, rating, url}

        const numberOfValues = Object.values(updatedInfo).filter(Boolean).length
        if(numberOfValues===0) {
            return res.status(400).send({error: {message: `Must include either, 'title', 'description', 'rating', or 'url'`}})
        }
        
        BookmarksService.updateBookmark(
            req.app.get('db'),
            req.params.id,
            updatedInfo
        )
        .then(response => {
            res.status(200).json(response[0])
        })
        .catch(next)
    })

module.exports = bookmarksRouter;