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
},
postNewBookmark(knex, newBookmark) {
    return knex
        .into('bookmarks')
        .insert(newBookmark)
        .returning('*')
        .then(res => {
            return res[0]
        })
},
deleteArticle(knex, id) {
    return knex('bookmarks')
        .where('id', id)
        .delete()
}
}

module.exports = BookmarksService;