var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient
var validUrl = require('valid-url');
var shortid = require('shortid');
var mongoURL = process.env.MONGO_URL;
app.use(express.static(__dirname + "/client/"))
var path = require('path');

app.get('/new/:arg*', function (req, res) {
  mongo.connect(mongoURL, function(err, db) {
    if (!err) {
      var url = req.url.substring(5);
      if (validUrl.isUri(req.params.arg)) {
        const newDoc = {"original_url":url, "short_url":"https://ltlurl.herokuapp.com/" + shortid.generate()};
        db.collection('urlcollection').insert(newDoc);
        res.setHeader('Content-Type', 'application/json');
        delete newDoc["_id"];
        res.send(JSON.stringify(newDoc));
      } else {
        res.send("URL invalid!")
      }
    } else {
      res.send("ERROR: " + req.url.substring(5) + " is invalid")
    }
  })
})

app.get('/:arg', function (req, res) {
  mongo.connect(mongoURL, function(err, db) {
    if (!err) {
      // db gives access to the database
      db.collection('urlcollection').find({short_url: "https://ltlurl.herokuapp.com/" + req.params.arg}).toArray(function(err, documents) {
          if (!err){
            console.log(documents)
            if (documents.length == 1) {
              console.log(documents);
              res.redirect(documents[0].original_url)
            } else if (documents.length > 1) {
              console.log("More than one document found!");
              res.send("More than one document found!");
            } else {
              console.log("No document found!");
              res.send("Didn't find the document!")
            }
          } else {
            res.send("Error connecting to mongo database")
          }
      });
      db.close();
    }
  });
});

app.get('*', function (req, res) {
  res.status(404)
  res.sendFile(path.join(__dirname, '/client/invalid.html'));
});

var port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});