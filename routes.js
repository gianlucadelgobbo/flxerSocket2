const passport = require('passport');
const Account = require('./models/account');
const Data = require('./models/data');
const router = require('express').Router();

router.get('/', function(req, res) {
  Data.find().exec((err, data) => {
    console.log("data");
    console.log(data);
    var send = {}
    data.forEach(item => {
      send[item.buy_id] = item.status;
    })
    res.render('index', {"data":send, user: req.session.passport ? req.session.passport.user : undefined});
  });
});

router.get('/register', function(req, res) {
  res.render('register', {});
});

router.get('/data', function(req, res) {
  if (req.query.json) {
    var date = new Date();
    date.setDate(date.getDate() - 1);

    Data.find({createdAt:{"$gte": date}}).select("-_id buy_id status").exec((err, data) => {
      console.log("data");
      console.log(data);
      res.json(data);
      //res.render('data', {"data":data, user: req.session.passport.user});
    });
  } else if (req.session.passport && req.session.passport.user) {
    Data.find().exec((err, data) => {
      res.render('data', {"data":data, user: req.session.passport.user});
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

router.post('/register', function(req, res, next) {
  console.log('registering user');
  Account.register(new Account({username: req.body.username}), req.body.password, function(err) {
    if (err) {
      console.log('error while user register!', err);
      return next(err);
    }

    console.log('user registered!');

    res.redirect('/');
  });
});
 */
router.get('/login', function(req, res) {
  res.render('login', {user: req.user, message: req.flash('error')});
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
      const message = JSON.parse(messageAsString);
      if (message.action == 'GETDATA') {
        Data.find().exec((err, data) => {
          [...clients.keys()].forEach((client) => {
            client.send(JSON.stringify(data));
          });
        });  
      } else if (message.action == 'SETDATA') {
        // PRENOTA
        var data_tosave = 
        [...clients.keys()].forEach((client) => {
          client.send(JSON.stringify({status: false, buy_id: message.buy_id}));
        });
        let tosave = new Data({status: false, buy_id: message.buy_id, email: message.email});
        tosave.save().then(savedDoc => {
      
        });
      } else if (message.action == 'UPDATEDATA') {

        [...clients.keys()].forEach((client) => {
          client.send(JSON.stringify({status: message.status, buy_id: message.buy_id}));
        });
        Data.findOne({_id:message.buy_id}).exec((err, data) => {
          data.status = message.status;
          data.save();
        });        
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
  clients.delete(ws);
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

console.log("wss up");

module.exports = router;