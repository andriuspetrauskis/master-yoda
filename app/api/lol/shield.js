'use strict';

var text = require('../helpers/text.js');
var repo = require('../repositories/lol.js');

module.exports = {
    'name': 'shield',
    'description': 'Shield from users',

    'run': function (request) {
        var parts = request.text.split(' ');
        this.shield(request.body.user_name, parts[1]);
    },

    'shield': function (user, mode){
        if (mode === "up") {
            repo.activateShield(user).then(function(object) {
                this.lol.send(text.shield_is_up);
            }.bind(this));
        } else if (mode === "down") {
            repo.deActivateShield(user).then(function(object) {
                this.lol.send(text.shield_is_down);
            }.bind(this));
        } else {
            this.lol.send(text.shield_typo);
        }

    },

    'lol': {}
};
