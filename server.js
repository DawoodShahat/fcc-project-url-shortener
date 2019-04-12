'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var cors = require('cors');
var uuid = require('uuid');
var shortUrlItem = require('./models/shortUrlItem');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !!**/ 
mongoose.connect("mongodb+srv://dawood:dkbluewhale@cluster0-8rmtt.mongodb.net/test?retryWrites=true", { useNewUrlParser: true })
  .then(() => console.log('Mongodb Successfully connected'))
  .catch( err => console.log(err));

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

function isValidUrl(req, res, next){
  var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  if(pattern.test(req.body.url)){
    next();
  }else {
    res.json({"error": "Invalid URL"});
  }
}

function urlExists(req, res, next){
  shortUrlItem.find({"url": req.body.url})
    .then( doc => {
      if(doc.length > 0){
        res.locals.exists = true;
        res.locals.shUrl = doc[0]._doc.shortUrl;
        next();
      }else {
        res.locals.exists = false;
        next();
      }
    })
    .catch( err => {
        // handle the error
        next();
    });
}

app.post('/api/hello', (req, res) => {
  console.log(req.body);
  res.json({"msg": req.body.url});
});
 
app.post("/api/shorturl/new", isValidUrl, urlExists, (req, res) => {
  const url = req.body.url;
  if(res.locals.exists){
    // return the existing short url
    res.json({ "original_url": url, "short_url": res.locals.shUrl });
    return;
  }else {
    // generate new short url 
    const hostname = new URL(url).hostname; // grabs the hostname from the url

    dns.lookup(hostname, (err, address, family) => {
      if(!err){
        const shUrl = uuid().split('-')[0]; // grabs the first part of the uuid string

        const shortURLItem = new shortUrlItem({
          url: url,
          shortUrl: shUrl
        });

        // update the database
        shortURLItem.save()
          .then((doc) =>  console.log(doc));

        res.json({ "original_url": url, "short_url": shUrl });
      }else {
        // if no ip exists for this url in dns
        res.json({"error": "Invalid URL"});
      }
    });

  }
});

app.get("/api/shorturl/:id", (req, res) => {
  shortUrlItem.find({ "shortUrl": req.params.id })
    .then(doc => {
      const redirectUrl = doc[0]._doc.url;
      console.log(redirectUrl);
      res.redirect(redirectUrl);
    })
});
  

app.listen(port, function () {
  console.log('Node.js listening ...');
});