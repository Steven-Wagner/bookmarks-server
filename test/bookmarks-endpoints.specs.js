const app = require('../src/app');
const knex = require('knex');
const {makeBookmarksTestData} = require('../src/bookmarks.fixtures');

describe('App', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.DB_URL_TEST
        })
        app.set('db', db)
    })

    after('disonnect from db', () => db.destroy());

    before('empty test table', () => db('bookmarks').truncate())

    afterEach('remove data from table', () => db('bookmarks').truncate())

    describe('GET /bookmarks', () => {
        context(`Given data is in 'bookmarks'`, () => {
            const testData = makeBookmarksTestData();
        
            beforeEach('add test data', () => {
                return db
                    .into('bookmarks')
                    .insert(testData)
            })

            it('GET /bookmarks returns all bookmarks', () => {
                return request(app)
                    .get('/bookmarks')
                    .set({'Authorization': `bearer ${process.env.API_TOKEN}`})
                    .expect(200, testData)
            })
        })
        context(`Given no data in 'bookmarks'`, () => {
            it(`GET /bookmarks returns []`, () => {
                return request(app)
                    .get('/bookmarks')
                    .set({'Authorization': `bearer ${process.env.API_TOKEN}`})
                    .expect(200, [])
            })
        })
    })

    describe('GET /bookmarks/:id', () => {
        context(`Given data is in 'bookmarks'`, () => {
            const testData = makeBookmarksTestData();
        
            beforeEach('add test data', () => {
                return db
                    .into('bookmarks')
                    .insert(testData)
            })
            it('GET bookmarks/:id returns correct bookmark', () => {
                const correctId = 2
                const correctBookmark = testData[correctId-1]
                return request(app)
                    .get(`/bookmarks/${correctId}`)
                    .set({'Authorization': `bearer ${process.env.API_TOKEN}`})
                    .expect(200, correctBookmark)
            })
        })
        context(`Given no data in 'bookmarks'`, () => {
            it('respond with 404', () => {
                const nonId = 12345
                return request(app)
                    .get(`/bookmarks/${nonId}`)
                    .set({'Authorization': `bearer ${process.env.API_TOKEN}`})
                    .expect(404, 'No id found' )
            })
        })
    })
})