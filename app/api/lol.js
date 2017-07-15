'use strict';

var moment = require('moment-precise-range');
var repo = require('../repositories/lol.js');
var text = require('../helpers/text.js');

var self = module.exports = {
    output: null,
    send: function (text, publicly) {
        if ('string' !== typeof text) {
            text = text.toString();
        }
        self.output.json({
            response_type: publicly?'in_channel':'ephemeral',
            text: text,
            parse: 'full',
            link_names: true
        });
    },
    setOutput: function (output) {
        self.output = output;
    },
    check: function (params) {
        if ('undefined' === typeof params.text) {
            throw new Error(text.empty_content);
        }
        if ('undefined' === typeof params.token || params.token !== process.env.SLACK_LOL_TOKEN) {
            throw new Error(text.hacking);
        }
    },

    'action': function (name) {
        name = name.toLowerCase().replace(/[^\w]/g, '');
        try {
            var action = require('./lol/' + name + '.js');
            action.lol = self;
            action.run.bind(action);
        } catch (err) {
            throw Error(text.invalid_command);
        }
    },

    'shield': function (user, mode){

        if (mode === "up") {
            repo.activateShield(user).then(function(object) {
            self.send(text.shield_is_up);
        });
        } else if (mode === "down") {
            repo.deActivateShield(user).then(function(object) {
            self.send(text.shield_is_down);
        });
        } else {
            self.send(text.shield_typo);
        }

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

            self.send(outputText.vars({$list: listedDeadUsers, $points: listedKillers}), publicly);
        }).catch(function (e) {
            self.send(e.message);
        });

    },
    getTimeByMetric: function (time, metric) {
        var result = moment(time).fromNow(true);
        if (-1 !== ['seconds', 'minutes', 'hours', 'days', 'months', 'years'].indexOf(metric)) {
            result = moment().diff(time, metric) + ' ' + metric;
        }
        if ('full' === metric) {
            result = moment().preciseDiff(time).replace('a few seconds', 'and a few seconds');
        }
        if ('date' === metric) {
            result = moment(time).format();
        }
        if ('timestamp' === metric) {
            result = time;
        }
        if ('timestampVsNow' === metric) {
            result = time + '/' + moment().format('x');
        }
        if ('ms' === metric) {
            result = parseInt(moment().format('x')) - time;
        }

        return result;
    }
};
