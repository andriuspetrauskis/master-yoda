'use strict';

var repo = require('../repositories/lol.js');

module.exports = {
    indexAction: function (req, res) {
        repo.getJoinedSince(parseInt(req.get('since'))).then(
            function (users) {
                return users.map(function (user) {
                    return {
                        'joined': user.joined,
                        'lastGame': user.summoners.reduce(function (prev, curr) {
                            return prev.lastGame > curr.lastGame ? prev : curr;
                        }).lastGame
                    };
                });
            }
        ).then(
            function (result) {
                res.jsonp(result);
            }
        );
    }
};