'use strict';

var mongo = require('promised-mongo');

module.exports = function() {
    var mongoHost = process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost';
    var mongoPort = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;
    var mongoDb = process.env.OPENSHIFT_MONGODB_DB_NAME || 'nodejs';
    var mongoAuth = '';
    if (process.env.MONGO_USER && process.env.MONGO_PASS) {
        mongoAuth = process.env.MONGO_USER + ':' + process.env.MONGO_PASS + '@';
    }
    var mongoURL = 'mongodb://' + mongoAuth + mongoHost + ':' + mongoPort + '/' + mongoDb;

    return mongo(mongoURL);
};