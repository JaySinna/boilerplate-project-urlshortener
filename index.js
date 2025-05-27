require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const urlParser = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory database to store URLs
let urlDatabase = {};
let counter = 1;

// POST endpoint to shorten URLs
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  const hostname = urlParser.parse(originalUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const short_url = counter++;
    urlDatabase[short_url] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: short_url
    });
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = req.params.short_url;
  const originalUrl = urlDatabase[short_url];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
