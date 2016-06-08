'use strict';

var yoda = require('../controllers/lol.js');
var recent = require('../controllers/recent.js');

module.exports = function(app) {
    app.post('/api/lol', yoda.lolAction);
};
module.exports = function(app) {
    app.post('/api/recent', recent.indexAction);
};