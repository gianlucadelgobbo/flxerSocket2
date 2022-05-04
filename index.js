#!/usr/bin/env node
var app = require('./app');
var pkg = require('./package.json');

app.set('port', process.env.PORT || 4000);

var server = app.listen(app.get('port'), function() {
  console.log(pkg.name, 'listening on port http://localhost:' + server.address().port);
});
