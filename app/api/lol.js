'use strict';

var rp = require('request-promise');
var moment = require('moment-precise-range');
var repo = require('../repositories/lol.js');
var text = require('../helpers/text.js');

var self = module.exports = {
    known_servers: ['na', 'eune', 'euw', 'br', 'kr', 'lan', 'las', 'oce', 'ru', 'tr'],
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

    help: function (){
        self.send(text.help_text);
    },

    'link': function (server, user, player) {
        self.checkServer(server);
        if ('undefined' === typeof server || 'undefined' === typeof player) {
            throw Error(text.bad_server_or_username);
        }
        server = server.toLowerCase();
        player = player.toLowerCase();
        rp('https://' + server + '.api.pvp.net/api/lol/' + server + '/v1.4/summoner/by-name/' + player +
            '?api_key=' + process.env.LOL_KEY
        ).then(function (text) {
            return JSON.parse(text);
        }, function failed(err) {
            if (-1 !== err.message.indexOf('403')) {
                throw new Error(text.could_not_access_api);
            }
            throw new Error(text.summoner_not_found);
        }).then(function (summonerData) {
            self.data = summonerData[player.replace(/ /g, '')];
            return repo.getSummonerCount(server, self.data.id);
        }).then(function (count) {
            if (count > 0) {
                throw new Error(text.account_already_linked);
            }
        }).then(function () {
            return repo.addSummoner(user, server, self.data.id, self.data.revisionDate);
        }).then(function () {
            var freeFor = moment(self.data.revisionDate).fromNow(true);
            self.send(text.league_free_for_linked.vars('$time', freeFor));
        }).catch(function (err){
            self.send(err.message);
        });
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
            self.send(outputText.vars({$user: user, $time: time}), publicly);
        }).catch(function (e) {
            self.send(e.message + text.no_linked_accounts);
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
    },

    top: function (players) {
        if ('undefined' === typeof players || !parseInt(players)) {
            players = 3;
        }
        repo.getTopUsers(+players).then(function (documents) {
            var result = text.top_list_header;
            documents.map(function (doc, index) {
                result += text.top_list_template.vars({
                    $no: index+1,
                    $user: doc._id,
                    $time: moment(doc.date).fromNow(true)
                });
            });
            result += text.top_list_footer;
            self.send(result, true);
        }).catch(function () {
            self.send(text.top_list_empty);
        });
    },

    total: function(metric) {
        repo.getTotalTime(+moment().format('x'), +moment('2015-08-04').format('x')).then(function (savedSeconds){
            var ago = moment().subtract(savedSeconds[0].total, 'milliseconds');
            var time = self.getTimeByMetric(ago, metric);
            self.send(text.total_saved_time.vars('$time', time), true);
        }).catch(function(e) {
            self.send(e + text.error);
        });
    },

    checkServer: function(server) {
        if ('undefined' === typeof server) {
            throw new Error(text.empty_server);
        }
        if (-1 === self.known_servers.indexOf(server.toLowerCase())) {
            throw new Error(text.unknown_server);
        }
    }
};
