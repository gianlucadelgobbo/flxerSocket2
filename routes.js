const passport = require('passport');
const Account = require('./models/account');
const Data = require('./models/data');
const router = require('express').Router();
const config = require('config');
const nodemailer = require("nodemailer");
require('dotenv').config()

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

router.get('/about', function(req, res) {
  res.render('about', {"data":{path:"a-at-metawaste.vev.site/faq-copy", src:"https://js.vev.design/v/4ZAF-zABJW/6074b01/vev.js"}});
});

router.get('/nft', function(req, res) {
  res.render('about', {"data":{path:"a-at-metawaste.vev.site/untitled-copy", src:"https://js.vev.design/v/gkYJXZVTvZ/895d056/vev.js"}});
});

router.get('/faq', function(req, res) {
  res.render('about', {"data":{path:"a-at-metawaste.vev.site/faq", src:"https://js.vev.design/v/XabRqDat9l/6074b01/vev.js"}});
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
  console.log("on 'connection'")
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

  let email = "Ciao,\n"+"your payment to \""+req.body.buy_id+"\" was successful!!!";
  email+= "*Dear visitor, you just crossed the Gateway!*\n";
  email+="You now booked your voxel \""+req.body.buy_id+"\" for 24hours.\n";
  email+="For every voxel there's an NFT you can easily collect (for free) following\n";
  email+="simple steps.\n";
  email+="Gateway's NFTs are created using Tezos, one of the cleanest blockchains.\n";
  email+="\n";
  email+=">>> HERE THE INSTRUCTIONS:\n";
  email+="\n";
  email+="1) *Create a KUKAI Wallet* (it will take 2 minutes), you don't need to buy any crypto (0 balance is fine): https://wallet.kukai.app/\n";
  email+="Kukai is a wallet enabling you to collect NFTs using the Tezos Blockchain.\n";
  email+="\n";
  email+="2) *Share with us your wallet address by replying to this email*, so that we can drop the NFT directly to your wallet\n";
  email+="(you will see it in the NFT/collectibles section of Kukai)\n";
  email+="\n";
  email+="Like every crypto wallet, Kukai has a 'wallet address'. Wallet addresses can be shared safely with anyone from whom you want to receive cryptocurrency or NFTs.\n";
  email+="\n";
  email+="You can find and copy your address from the top bar\n";
  email+="\n";
  email+="\n";
  email+="<<<\n";
  email+="\n";
  email+="If we won't receive a wallet address from you within 24 hours, the selected\n";
  email+="voxel will be unlocked and you won't get the NFT.\n";
  email+="\n";
  email+="Please check the FAQ https://ted.avnode.net/faq for other information.\n";
  email+="\n";
  email+="\n";
  email+=">>>\n";
  email+="\n";
  email+="If you have received this message by mistake, please inform us by an\n";
  email+="email-reply and then delete the message.\n";
  email+="\n";
  email+="\n";
  email+="The Gateway team\n";
  email+="\n";
  email+="--";

  var htmlEmail = "";
  htmlEmail+='<div style="font-family: Arial, Helvetica, sans-serif">';
  htmlEmail+='	<div><font size="4"><b>Dear visitor, you just crossed the Gateway!</b><br/>You now booked your voxel "'+req.body.buy_id+'" for 24hours.</font></div>';
  htmlEmail+='	<div style="font-size:large">';
  htmlEmail+='		For every voxel there&#39;s an NFT you can easily collect (for free) following simple steps.';
  htmlEmail+='		<br>';
  htmlEmail+='		Gateway&#39;s NFTs are created using Tezos, one of the cleanest blockchains.';
  htmlEmail+='	</div>';
  htmlEmail+='	';
  htmlEmail+='	<div>';
  htmlEmail+='	<br>';
  htmlEmail+='	</div>';
  htmlEmail+='	<div>&gt;&gt;&gt; HERE THE INSTRUCTIONS:</div>';
  htmlEmail+='	<ol>';
  htmlEmail+='		<li>';
  htmlEmail+='			<b>Create a KUKAI Wallet</b> (it will take 2 minutes), you don&#39;t need to buy any crypto (0 balance is fine): <a href="https://wallet.kukai.app/" target="_blank">https://wallet.kukai.app/</a>';
  htmlEmail+='			<br/>';
  htmlEmail+='			<font size="1">Kukai is a wallet enabling you to collect NFTs using the Tezos Blockchain.</font>';
  htmlEmail+='		</li>';
  htmlEmail+='		<li>';
  htmlEmail+='			<b>Share with us your wallet address by replying to this email</b>, so that we can drop the NFT directly to your wallet';
  htmlEmail+='			<br/>(you will see it in the NFT/collectibles section of Kukai)';
  htmlEmail+='		</li>';
  htmlEmail+='	</ol>';
  htmlEmail+='	<p><font size="1">Like every crypto wallet, Kukai has a &quot;wallet address&quot;. Wallet addresses can be shared safely with anyone from whom you want to receive cryptocurrency or NFTs.<br />You can find and copy your address from the top bar, see the picture below:</font></p>';
  htmlEmail+='	';
  htmlEmail+='	<p><img src="https://ted.avnode.net/img/kukai.jpg" width="562" height="99"></p>';
  htmlEmail+='	';
  htmlEmail+='	<p>&lt;&lt;&lt;</p>';
  htmlEmail+='		';
  htmlEmail+='	<p><font size="4">If we won&#39;t receive a wallet address from you within 24 hours, the selected voxel will be unlocked and you won&#39;t get the NFT.</font></p>';
  htmlEmail+='	';
  htmlEmail+='	<p><font size="4">Please check the <a href="https://ted.avnode.net/faq" target="_blank">FAQ</a> for other information.</font></p>';
  htmlEmail+='		';
  htmlEmail+='	<p>&gt;&gt;&gt;</p>';
  htmlEmail+='	';
  htmlEmail+='	<p>If you have received this message by mistake, please inform us by an email-reply and then delete the message.</p>';
  htmlEmail+='	';
  htmlEmail+='	<p>';
  htmlEmail+='		<font size="4">The Gateway team</font>';
  htmlEmail+='		<br>';
  htmlEmail+='		-- ';
  htmlEmail+='		<br>';
  htmlEmail+='		<img width="200" height="53" src="https://ted.avnode.net/img/signature.png">';
  htmlEmail+='	</p>';
  htmlEmail+='</div>';

  const mail = {
    from: process.env.MAILFROM,
    to: req.body.email,
    subject: "Booking confirm | NFT N° " + req.body.buy_id,
    text: email,
    html: htmlEmail
  };

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAILUSER,
      pass: process.env.PASSWORD
    }
  });
  
  console.log(transporter);

  console.log("createTransport");
  transporter.sendMail(mail, function(err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("info.messageId: " + info.messageId);
      console.log("info.envelope: " + info.envelope);
      console.log("info.accepted: " + info.accepted);
      console.log("info.rejected: " + info.rejected);
      console.log("info.pending: " + info.pending);
      console.log("info.response: " + info.response);
    }
    transporter.close();
    console.log(err || info);
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
        console.log("errorerrorerrorerrorerrorerror");
        console.log(error);
        console.log(error.message);
        errMsg =  "<b>"+req.body.email + "</b> already booked an NFT.";
      } else {
        errMsg = error.message;
      }
      res.status(400).json({ statusText: "Bad Request", message: errMsg });
    });
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