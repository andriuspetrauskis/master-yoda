'use strict';

var yoda = require('../controllers/lol.js');

module.exports = function(app) {
    app.post('/api/lol', yoda.lolAction);
};