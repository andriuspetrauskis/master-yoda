'use strict';

var express = require('express');
var app = express();
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8680;
var ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

require('./app/routes/api.js')(app);

app.get('*', function(req, res) {
    res.statusCode = 404;
    res.json({
        'code': 404,
        'error': 'Not found!'
    });
});

app.listen(port, ip);
console.log('Server is Up and Running at Port : ' + port);
