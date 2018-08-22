// OpenShift Node application
var express = require('express'),
    app     = express(),
    http    = require('http').Server(app),
    io      = require('socket.io')(http),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

//app.engine('html', require('ejs').renderFile);
//app.use(morgan('combined'))

app.use(express.static(__dirname + '/static/'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

//app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
//  if (!db) {
//    initDb(function(err){});
//  }
//  if (db) {
//    var col = db.collection('counts');
    // Create a document with request IP and current time of request
//    col.insert({ip: req.ip, date: Date.now()});
//    col.count(function(err, count){
//      if (err) {
//        console.log('Error running count. Message:\n'+err);
//      }
//      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
//    });
//  } else {
//    res.render('index.html', { pageCountMessage : null});
//  }
//});

// host client @ base url
app.get('/', function (req, res) { 
    res.render('index.html')
});

// join room on connect
io.on('connection', function(socket){ 
  socket.on('join', function(room) {
    socket.join(room);
    console.log('user joined room: ' + room);
  });
  // move object emitter
  socket.on('move', function(move) { 
    console.log('user moved: ' + JSON.stringify(move));
    io.emit('move', move);
  });
});

//app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
//  if (!db) {
//    initDb(function(err){});
//  }
//  if (db) {
//    db.collection('counts').count(function(err, count ){
//      res.send('{ pageCount: ' + count + '}');
//    });
//  } else {
//    res.send('{ pageCount: -1 }');
//  }
//});

// error handling
//app.use(function(err, req, res, next){
//  console.error(err.stack);
//  res.status(500).send('Something bad happened!');
//});

//initDb(function(err){
//  console.log('Error connecting to Mongo. Message:\n'+err);
//});

//app.listen(port, ip);
//console.log('Server running on http://%s:%s', ip, port);

//module.exports = app ;

function getRoom() {
  if (rooms == []) {
    rooms[0] = ["White0", "Black0"];
    return 0;
  }
  rooms[rooms.length] = ["White"+rooms.length, "Black"+rooms.length];
  return rooms.length;
}

// Initialization
var rooms = [];

// run http and web socket server
var server = http.listen(port, function () { 
// var host = server.address().address;
  var host = ip;
  var port = server.address().port;
  console.log('Server listening at address ' + host + ', port ' + port);
});
