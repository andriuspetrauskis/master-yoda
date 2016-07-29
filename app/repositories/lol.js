'use strict';

var db = require('../db.js')();

module.exports = {
    getSummonerCount: function (server, id) {
        return db.lol.count({
            'summoners.id': id,
            'summoners.server': server
        });
    },
    getUser: function (user) {
        return db.lol.find({ name: user }).limit(1);
    },
    addSummoner: function (user, server, id, lastGame) {
        return db.lol.update({
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
    getTopUsers: function (count) {
        return db.lol.aggregate(
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
        return db.lol.aggregate(
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
        return db.lol.aggregate(
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
        return db.lol.update({
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
        return db.lol.find(
            {
                "joined": { $gt: since }
            }
        );
    },
    getPlayedSince: function (since) {
        return db.lol.aggregate(
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