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
deleteBookmark(knex, id) {
    return knex('bookmarks')
        .where('id', id)
        .delete()
},
updateBookmark(knex, id, updateData){
    return knex('bookmarks')
        .where('id', id)
        .update(updateData)
        .returning('*')
}
}

module.exports = BookmarksService;