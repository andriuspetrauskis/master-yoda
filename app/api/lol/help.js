'use strict';

var text = require('../helpers/text.js');


module.exports = {
    'name': 'help',
    'description': 'Show the help',

    'run': function () {
        this.lol.send(text.help_text);
    },

    'lol': {}
};
