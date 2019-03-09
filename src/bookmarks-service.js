const BookmarksService = {

getAllBookmarks(knex) {
    return knex('bookmarks')
        .select('*')
},
getBookmarkById(knex, id) {
    return knex('bookmarks')
        .select('*')
        .where('id', id)
        .first()
}
}

module.exports = BookmarksService;