'use strict';

var repo = require('../repositories/lol.js');

module.exports = {
    indexAction: function (req, res) {
        repo.getJoinedSince(parseInt(req.query.since)).then(
            function (users) {
                return users.map(function (user) {
                    return {
                        'joined': user.joined,
                        'lastGame': user.summoners.reduce(function (prev, curr) {
                            return prev.lastGame > curr.lastGame ? prev : curr;
                        }).lastGame
                    };
                });
            },
            function failure (err) {
                res.json({ error: err.message });
            }
        ).then(
            function (result) {
                res.json(result);
            }
        );
    },
    recentAction: function (req, res) {
        repo.getPlayedSince(parseInt(req.query.since)).then(
            function (result) {
                res.json(result);
            },
            function (e) {
                res.json({error: e.message});
            }
        );
    }
};