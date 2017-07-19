'use strict';

var moment = require('moment-precise-range');
var text = require('../helpers/text.js');
var repo = require('../repositories/lol.js');
var adapter = require('../adapters/riotgames/lol.js');


var self = module.exports = {
    'name': 'link',
    'description': 'Link your LoL account to this Slack group',

    'run': function (request) {
        var parts = request.text.split(' ');
        this.link(parts[1], request.body.user_name, parts.slice(2).join(' '));
    },
    'link': function (server, user, player) {
        if ('undefined' === typeof server || 'undefined' === typeof player) {
            throw Error(text.bad_server_or_username);
        }
        server = server.toLowerCase();
        player = player.toLowerCase();
        adapter.byName(server, player, {
            'fail': function failed(err) {
                if (-1 !== err.message.indexOf('403')) {
                    throw new Error(text.could_not_access_api);
                }
                throw new Error(text.summoner_not_found);
            }
        }).then(function (summonerData) {
            return {
                data: summonerData[player.replace(/ /g, '')],
                count: repo.getSummonerCount(server, self.data.id)
            };
        }).then(function (res) {
            if (res.count > 0) {
                throw new Error(text.account_already_linked);
            }
            return res;
        }).then(function (res) {
            res.updateResult = repo.addSummoner(user, server, res.data.id, res.data.revisionDate);
            return res;
        }).then(function (res) {
            var freeFor = moment(res.data.revisionDate).fromNow(true);
            self.lol.send(text.league_free_for_linked.vars('$time', freeFor));
        }).catch(function (err){
            self.lol.send(err.message);
        });
    },

    'lol': {}
};
