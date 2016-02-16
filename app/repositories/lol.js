'use strict';

var db = require('../db.js')();

module.exports = {
    getSummonerCount: function (server, id) {
        return db.collection('lol').count({
            'summoners.id': id,
            'summoners.server': server
        });
    },
    getUser: function (user) {
        return db.collection('lol').find({ name: user }).limit(1);
    },
    addSummoner: function (user, server, id, lastGame) {
        return db.collection('lol').update({ name: user }, {
            '$push': {
                summoners: {
                    id: id,
                    server: server,
                    lastGame: lastGame,
                    lastCheck: new Date().getTime()
                }
            }
        }, {
            upsert: true
        });
    },
    getTopUsers: function (count) {
        return db.collection('lol').aggregate(
            {
                $unwind: '$summoners'
            },
            {
                $group: {
                    _id: '$name',
                    date: {
                        $max: '$summoners.lastGame'
                    }
                }
            },
            {
                $sort: {
                    'date': 1
                }
            },
            {
                $limit: count
            }
        )
    },
    getLeastCheckedSummoners: function () {
        return db.collection('lol').aggregate(
            {
                $unwind: '$summoners'
            },
            {
                $group: {
                    _id : '$summoners.server',
                    ids: {
                        $push: '$summoners.id'
                    },
                    checked: {
                        $push: '$summoners.lastCheck'
                    }
                }
            },
            {
                $sort: {
                    'checked': 1
                }
            }
        );
    },
    updateSummonerDate: function (server, id, lastGame) {
        return db.collection('lol').update({
            'summoners.server': server,
            'summoners.id': id
        }, {
            $set: {
                'summoners.$.lastCheck': new Date().getTime(),
                'summoners.$.lastGame': lastGame
            }
        });
    }
};