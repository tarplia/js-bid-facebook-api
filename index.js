const fs = require('fs');
const FB = require('fb');
const https = require('https');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const port = 3000;
const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'abc',
  cookie: {},
}));

app.get('/', (req, res) => {
  res.render('home')
});

// Accepts an access_token in the request body as url-encoded.
app.post('/login', (req, res) => {
  FB.setAccessToken(req.body.access_token);
  FB.api('/me', (response) => {
    if (response.error) {
      res.redirect('/error');
      return;
    }
    req.session.user = response;
    res.redirect('/bid');
  });
});

// Store the bids in memory.
// Auctions only last a few days so we don't need persistence storage to get
// the winner.
let bids = new Map();

// Shows bid information if there is an authenticated user in the session.
app.get('/bid', (req, res) => {
  if (!req.session.user) {
    res.send(401);
    return;
  }

  let highest;
  for (const [userId, bid] of bids) {
    if (!highest || bid > highest.bid) {
      highest = { userId, bid };
    }
  }

  let areYouHighest = highest ? highest.userId === req.session.user.id : false;

  let currentBid = bids.get(req.session.user.id);

  const model = {
    userName: req.session.user.name,
    highestBid: highest ? highest.bid : 0,
    areYouHighest: areYouHighest,
    currentBid: currentBid ? currentBid : 0,
  };

  res.render('bid', model);
});

// Sets the bid of the authenticated user.
app.post('/bid', (req, res) => {
  if (!req.session.user) {
    res.send(401);
    return;
  }

  bids.set(req.session.user.id, req.body.bid);
  res.redirect('/bid');
});

https
  .createServer({
    key: fs.readFileSync('./certs/tls.key'),
    cert: fs.readFileSync('./certs/tls.cert')
  }, app)
  .listen(3000);
