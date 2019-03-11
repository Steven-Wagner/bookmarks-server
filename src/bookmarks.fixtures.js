function makeBookmarksTestData() {
return  [
     {
       id: 1,
       title: 'Google',
       url: 'http://www.google.com',
       rating: 3,
       description: 'Internet-related services and products.'
     },
     {
       id: 2,
       title: 'Thinkful',
       url: 'http://www.thinkful.com',
       rating: 5,
       description: '1-on-1 learning to accelerate your way to a new high-growth tech career!'
     },
     {
       id: 3,
       title: 'Github',
       url: 'http://www.github.com',
       rating: 4,
       description: 'brings together the world\'s largest community of developers.'
     }
  ];
}

function makeBookmarkPostTest() {
  const expected = 
    {
      id: 1,
      title: 'Test Title',
      url: 'http://www.test-this.com',
      rating: 4,
      description: 'Test description'
    };
  const newBookmark =
    {
      title: 'Test Title',
      url: 'http://www.test-this.com',
      rating: 4,
      description: 'Test description'
    };
  return {expected, newBookmark}
}

function makeMaliciousBookmark() {
  const expected = 
  {
    id: 1,
    rating: 4,
    title: `Naughty &lt;script&gt;alert("xxs");&lt;/script&gt;`,
    url: 'http://www.test-this.com',
    description: `Bad image <img src="https://url-fake-does-not.exists">. But not <strong>all&lt;/strong bad.`
  }
  const maliciousBookmark = 
  {
    title: 'Naughty <script>alert("xxs");</script>',
    rating: 4,
    url: 'http://www.test-this.com',
    description: `Bad image <img src="https://url-fake-does-not.exists" onerror-"alert(document.cookie);">. But not <strong>all</strong bad.`
  }

  return {
    expected,
    maliciousBookmark
  }
}

  module.exports = {makeBookmarksTestData, makeBookmarkPostTest, makeMaliciousBookmark};