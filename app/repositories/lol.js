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
    recordKill: function(winner, winnerScore, loser, date) {
        db.collection('lol').update({
            'name': winner
        }, {
            $set: {
                'utc': date,
                'points': winnerScore,
                'dead': false
            }
        });

        db.collection('lol').update({
            'name': loser
        }, {
            $set: {
                'utc': date,
                'dead': true
            }
        });

    },
    accident: function(user, date) {
        db.collection('lol').update({
            'name': user
        }, {
            $set: {
                'utc': date,
                'dead': true
            }
        });
    },
    getFoughtUsers: function(date) {
        return db.collection('lol').find({
            'utc': date
        });
    },
    addSummoner: function (user, server, id, lastGame) {
        return db.collection('lol').update({
            name: user
        }, {
            '$push': {
                summoners: {
                    id: id,
                    server: server,
                    lastGame: lastGame,
                    lastCheck: new Date().getTime()
                }
            },
            '$set': {
                name: user,
                joined: new Date().getTime()
            }
        }, {
            upsert: true
        });
    },
    activateShield: function (user) {
        return db.collection('lol').update({
            name: user
        }, {
            '$set': {
                shield: true
            }
        });
    },
    deActivateShield: function (user) {
        return db.collection('lol').update({
            name: user
        }, {
            '$set': {
                shield: false
            }
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
    getTotalTime: function (now, created) {
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
                $match : {
                    "date" : { $gt : created }
                }
            },
            {
                $project: {
                    saved: {
                        $subtract: [now, "$date"]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$saved"
                    }
                }
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
    },
    getJoinedSince: function (since) {
        return db.collection('lol').find(
            {
                "joined": { $gt: since }
            }
        );
    },
    getPlayedSince: function (since) {
        return db.collection('lol').aggregate(
            {
                $unwind: '$summoners'
            },
            {
                $group: {
                    _id: '$name',
                    lastGame: {
                        $max: '$summoners.lastGame'
                    },
                    joined: { $first: '$joined' }
                }
            },
            {
                $match : {
                    "joined" : { $gte : since }
                }
            },
            {
                $project: {
                    joined: 1,
                    lastGame: 1,
                    _id: 0
                }
            }
        );
    }
};