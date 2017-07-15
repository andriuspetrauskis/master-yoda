'use strict';

var text = require('../helpers/text.js');
var repo = require('../repositories/lol.js');

module.exports = {
    'name': 'slain',
    'description': 'Show slain users',

    'run': function () {
        this.slainUsers();
    },

    'slainUsers': function () {
        var utc = new Date().toJSON().slice(0,10);

        repo.getFoughtUsers(utc).then(function(object){
            var listedDeadUsers = object.filter(function(returnedUser){
                return returnedUser.dead;
            }).map(function(user){
                return user.name;
            });

            var listedKillers = object.filter(function(returnedUser){
                return returnedUser.points;
            }).map(function(user){
                return user.name + " with " + user.points + " victories\n";
            });

            var outputText = text.listOfDeadUsers;
            var publicly = true;

            this.lol.send(outputText.vars({$list: listedDeadUsers, $points: listedKillers}), publicly);
        }).catch(function (e) {
            this.lol.send(e.message);
        });
    },

    'lol': {}
};
