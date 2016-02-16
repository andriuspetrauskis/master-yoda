'use strict';

var rp = require('request-promise');
var moment = require('moment');
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
        // to do: add check for token
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
            self.send(text.league_free_for.vars('$time', freeFor));
        }).catch(function (err){
            self.send(err.message);
        });
    },

    'status': function (user, privatelly) {
        repo.getUser(user).then(function(object) {
            var dates = object[0].summoners.map(function (item) {
                return item.lastGame;
            });
            var last = Math.max.apply(null, dates);
            var time = moment(last).fromNow(true);
            if ('me' === privatelly) {
                self.send(text.stopped_playing_league_ago.vars({$user: user, $time: time }));
            } else {
                self.send(text.user_is_not_playing_public.vars({$user: user, $time: time}), true);
            }
        }).catch(function () {
            self.send(text.no_linked_accounts);
        });
    },

    top: function () {
        repo.getTopUsers(3).then(function (documents) {
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

    checkServer: function(server) {
        if ('undefined' === typeof server) {
            throw new Error(text.empty_server);
        }
        if (-1 === self.known_servers.indexOf(server.toLowerCase())) {
            throw new Error(text.unknown_server);
        }
    }
};
