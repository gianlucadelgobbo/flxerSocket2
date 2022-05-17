const passport = require('passport');
const Account = require('./models/account');
const Data = require('./models/data');
const router = require('express').Router();
const config = require('config');

router.get('/', function(req, res) {
  var date = new Date();
  date.setTime(date.getTime() - (config.delay * 60 * 1000));
  Data.find({$or:[{createdAt:{"$gte": date}},{status: "comprato"}]}).select("-_id -email -updatedAt -__v").exec((err, data) => {
    console.log("data get");
    console.log(config.env);
    var send = {}
    data.forEach(item => {
      send[item.buy_id] = item.status;
    })
    res.render('index', {"data":send, "full":data, config:config, user: req.session.passport ? req.session.passport.user : undefined, wsdomain: config[config.env].wsdomain});
  });
});

router.get('/data', function(req, res) {
  if (req.query.json) {
    var date = new Date();
    date.setTime(date.getTime() - (config.delay * 60 * 1000));

    Data.find({$or:[{createdAt:{"$gte": date}},{status: "comprato"}]}).select("-_id buy_id status").exec((err, data) => {
      console.log("data");
      console.log(data);
      res.json(data);
      //res.render('data', {"data":data, user: req.session.passport.user});
    });
  } else if (req.session.passport && req.session.passport.user) {
    Data.find().sort([['createdAt', -1]]).exec((err, data) => {
      res.render('data', {"full":data, "data":data, config:config, user: req.session.passport.user, wsdomain: config[config.env].wsdomain});
    });
  } else {
    res.redirect('/');
  }
});



/* router.get('/save', function(req, res) {
  //http://localhost:4000/save?email=g.delgobbo@flyer.it&buy_id=123
  console.log(req.query);
  req.query.status = false;
  let tosave = new Data(req.query);
  tosave.save().then(savedDoc => {

    Data.find().exec((err, data) => {

      console.log("data");
      console.log(data.map(item => {var bella = {}; bella[item.buy_id] = item.status; return bella;}));
      res.render('data', {user: req.user, "data":data});
    });
  });
});

router.get('/register', function(req, res) {
  res.render('register', {});
});

router.post('/register', function(req, res, next) {
  console.log('registering user');
  Account.register(new Account({username: req.body.username}), req.body.password, function(err) {
    if (err) {
      console.log('error while user register!', err);
      return next(err);
    }

    console.log('user registered!');

    res.redirect('/data');
  });
});
 */
router.get('/login', function(req, res) {
  res.render('login', {user: req.user, config:config, message: req.flash('error')});
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res) {
  res.redirect('/data');
});



router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

wss.on('connection', (ws) => {
  console.log("on('connection'")
  const id = uuidv4();
  const color = Math.floor(Math.random() * 360);
  const metadata = { id, color };

  clients.set(ws, metadata);

  ws.on('message', (messageAsString) => {
    console.log(messageAsString)
    const message = JSON.parse(messageAsString);
    console.log(message)
    if (message.action == 'GETDATA') {
      Data.find().exec((err, data) => {
        [...clients.keys()].forEach((client) => {
          client.send(JSON.stringify(data));
        });
      });  
    } else if (message.action == 'UPDATEDATA') {

      [...clients.keys()].forEach((client) => {
        client.send(JSON.stringify({status: message.status, buy_id: message.buy_id}));
      });
      Data.findOne({_id:message.id}).exec((err, data) => {
        data.status = message.status;
        data.save();
      });        
    } else if (message.action == 'DELETEDATA') {
      [...clients.keys()].forEach((client) => {
        client.send(JSON.stringify({buy_id: message.buy_id}));
      });
      console.log(message.action)
      Data.deleteOne({buy_id:message.buy_id}).exec((err) => {
      });        
    } else if (message.action == 'EXPIREDATA') {
      [...clients.keys()].forEach((client) => {
        client.send(JSON.stringify({status: message.status, buy_id: message.buy_id}));
      });
      console.log(message.action)
    }

    /*  const message = JSON.parse(messageAsString);
    const metadata = clients.get(ws);

    message.sender = metadata.id;
    message.color = metadata.color;

    [...clients.keys()].forEach((client) => {
      client.send(JSON.stringify(message));
    }); */
  });  
});

wss.on("close", () => {
  console.log('disconnected');
  clients.delete(ws);
});

router.post('/', function(req, res) {
  console.log("req.body")
  console.log(req.body)
  // PRENOTA

  let tosave = new Data({status: "prenotato", buy_id: req.body.buy_id, email: req.body.email});
  tosave.save().then((data) => {
    [...clients.keys()].forEach((client) => {
      client.send(JSON.stringify({status: "prenotato", buy_id: req.body.buy_id}));
    });

   return res.status(201).json({
      statusText: "created",
      message: "document created successfully",
      data: data,
    });
  })
  .catch((error) => {

    // Set custom error for unique keys
    let errMsg;
    if (error.code == 11000) {
      errMsg = Object.keys(error.keyValue)[0] + " already exists.";
    } else {
      errMsg = error.message;
    }
    res.status(400).json({ statusText: "Bad Request", message: errMsg });
  });
});


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

console.log("wss up");

module.exports = router;