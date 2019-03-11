const app = require('../src/app');
const knex = require('knex');
const {makeBookmarksTestData, makeBookmarkPostTest, makeMaliciousBookmark} = require('../src/bookmarks.fixtures');

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
        context(`malicious data is removed`, () => {
            const {expected, maliciousBookmark} = makeMaliciousBookmark();

            beforeEach('Add malicious bookamrk', () => {
                return db 
                    .into('bookmarks')
                    .insert(maliciousBookmark)
            })
            it(`malicious bookmark data is removed`, () => {
                return request(app)
                    .get('/bookmarks')
                    .set({'Authorization': `bearer ${process.env.API_TOKEN}`})
                    .then(res => {
                        expect(res.body[0]).to.eql(expected)
                    })
            })
        })

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
    describe('POST /bookmarks', () => {
        const {expected, newBookmark} = makeBookmarkPostTest()

        it(`POST /bookmarks adds article to database`, () => {
            return request(app)
                .post('/bookmarks')
                .send(newBookmark)
                .set({'Authorization': `bearer ${process.env.API_TOKEN}`})
                .then(res => {
                    expect(res.body.title).to.eql(expected.title)
                    expect(res.body.url).to.eql(expected.url)
                    expect(res.body.description).to.eql(expected.description)
                })
        })
        const requiredFields = ['title', 'url', 'decription', 'rating']
        requiredFields.forEach(field => {
            const newBookmark = {
                title: 'test new article',
                rating: 4,
                url: 'http://test.com'
            }
            it(`validates all fields for posted bookmark`, () => {
                delete newBookmark[field]

                return request(app)
                    .post('/bookmarks')
                    .send(newBookmark)
                    .set({'Authorization': `bearer ${process.env.API_TOKEN}`})
                    .expect(400)
            })
        })

        it(`POST /bookmarks prevents malicious posts`, () => {
            const {expected, maliciousBookmark} = makeMaliciousBookmark();

            return request(app)
                .post('/bookmarks')
                .send(maliciousBookmark)
                .set({'Authorization': `bearer ${process.env.API_TOKEN}`})
                .then(res => {
                    expect(res.body).to.eql(expected)
                })
        })
    })
    describe(`DELETE /bookmarks/:id`, () => {
        context('There are bookmarks in the database', () => {
            const testData = makeBookmarksTestData();
            
            beforeEach(`add data to bookmarks`, () => {
                return db
                    .into('bookmarks')
                    .insert(testData)
            })
            it(`delete the correct bookmark by id`, () => {
                idToDelete = 2
                expectedResult = testData.filter(bookmark => bookmark.id !== idToDelete)
                
                return request(app)
                    .delete(`/bookmarks/${idToDelete}`)
                    .set({'Authorization': `bearer ${process.env.API_TOKEN}`})
                    .expect(204)
                    .then(res => 
                        request(app)
                            .get('/bookmarks')
                            .set({'Authorization': `bearer ${process.env.API_TOKEN}`})
                            .expect(expectedResult)
                    )
            })
            it('Id does not exist', () => {
                idToDelete = 12345

                return request(app)
                    .delete(`/bookmarks/${idToDelete}`)
                    .set({'Authorization': `bearer ${process.env.API_TOKEN}`})
                    .expect(404, {error: {message: 'id does not exist'}})
            })
        })
    })
})