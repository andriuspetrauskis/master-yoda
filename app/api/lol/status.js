'use strict';

var text = require('../helpers/text.js');
var repo = require('../repositories/lol.js');
var moment = require('moment-precise-range');


var self = module.exports = {
    'name': 'status',
    'description': 'Show your/other user\'s status',

    'run': function (request) {
        var parts = request.body.text.split(' ');
        self.status(request.body.user_name, parts[1], parts[2]);
    },
    'status': function (user, about, metric) {
        if ('undefined' !== typeof about && '@' === about.charAt(0) && '@' !== about) {
            user = about.substr(1);
        }
        if ('undefined' === typeof metric) {
            metric = about;
        }
        repo.getUser(user).then(function(object) {
            if ('undefined' === typeof object[0]) {
                throw new Error('@' + about + ' ');
            }
            var dates = object[0].summoners.map(function (item) {
                return item.lastGame;
            });
            var last = Math.max.apply(null, dates);
            var publicly = false;
            var outputText = '';
            var time = self.getTimeByMetric(last, metric);
            if ('me' === about) {
                outputText = text.league_free_for_short_private;
                if (+moment().diff(last, 'hours') > 24) {
                    outputText = text.league_free_for_average_private;
                }
                if (+moment().diff(last, 'days') > 40) {
                    outputText = text.league_free_for_long_private;
                }
            } else {
                outputText = text.league_free_for_short_public;
                if (+moment().diff(last, 'days') > 3) {
                    outputText = text.league_free_for_betweenshortandaverage_public;
                }
                if (+moment().diff(last, 'days') > 7) {
                    outputText = text.league_free_for_average_public;
                }
                if (+moment().diff(last, 'days') > 30) {
                    outputText = text.league_free_for_long_public;
                }
                publicly = true;
            }
            self.lol.send(outputText.vars({$user: user, $time: time}), publicly);
        }).catch(function (e) {
            self.lol.send(e.message + text.no_linked_accounts);
        });
    },
    'lol': {}
};
