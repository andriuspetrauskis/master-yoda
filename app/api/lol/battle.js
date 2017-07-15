'use strict';

var text = require('../helpers/text.js');
var repo = require('../repositories/lol.js');

module.exports = {
    'name': 'battle',
    'description': 'Battle users',

    'run': function (request) {
        this.battle(request.body.user_name, request.text.split(' ').slice(2).join(' '));
    },

    'battle': function (user, target) {
        //format target
        if ('undefined' !== typeof target && '@' === target.charAt(0) && '@' !== target) {
            var formattedTarget = target.substr(1);
        }

        //variable to see if both user and target data is collected
        var dataCollected = false;

        //store player data
        var userLastPlayed = 0;
        var targetLastPlayed = 0;

        //current scores - to be updated from server
        var userKillScore;
        var targetKillScore;

        //today's date
        var utc = new Date().toJSON().slice(0,10);

        //get user data
        repo.getUser(user).then(function(object) {
            if ('undefined' === typeof object[0]) {
                throw new Error('@' + user + " " + text.no_linked_accounts);
            }

            if (object[0]['utc'] === utc && object[0]['dead']) {
                throw new Error('@' + user + " " + text.already_died_today);
            }

            if (object[0]['shield']) {
                throw new Error('@' + user + " " + text.shield_still_up);
            }

            if (object[0]['utc'] === utc) {
                userKillScore = object[0]['points'] + 1;
            } else {
                userKillScore = 1;
            }

            if (Math.random() > 0.8) {
                repo.accident(user, utc).then(function(){
                    this.lol.send(text.accident, publicly);
                    throw new Error('@' + user + " " + text.accident);
                })
            }

            var dates = object[0].summoners.map(function (item) {
                return item.lastGame;
            });

            var last = Math.max.apply(null, dates);

            userLastPlayed = Date.now() - last;

            if (dataCollected) {
                fight(userLastPlayed, targetLastPlayed);
            } else {
                dataCollected = true;
            }

        }).catch(function (e) {
            this.lol.send(e.message);
        });

        //get target data
        repo.getUser(formattedTarget).then(function(object) {
            if ('undefined' === typeof object[0]) {
                throw new Error('@' + formattedTarget + ' ');
            }

            if (object[0]['utc'] === utc && object[0]['dead']) {
                throw new Error('@' + formattedTarget + " " + text.target_already_died_today);
            }

            if (object[0]['shield']) {
                throw new Error('@' + user + " " + text.enemy_has_shield);
            }

            if (object[0]['utc'] === utc) {
                targetKillScore = object[0]['points'] + 1;
            } else {
                targetKillScore = 1;
            }

            var dates = object[0].summoners.map(function (item) {
                return item.lastGame;
            });

            var last = Math.max.apply(null, dates);

            targetLastPlayed = Date.now() - last;

            if (dataCollected) {
                fight(userLastPlayed, targetLastPlayed);
            } else {
                dataCollected = true;
            }
        }).catch(function (e) {
            this.lol.send(e.message + text.error);
        });

        //fight using last played data from user and target, and respond with battle result
        function fight(userLastPlayedTime, targetLastPlayedTime) {
            //calculate odds using data
            var userPower = 12.25062252 * Math.log(userLastPlayedTime) - 225.7566385;
            var targetPower = 12.25062252 * Math.log(targetLastPlayedTime) - 225.7566385;

            //calculating weeks without playing
            var userWeeks = Math.floor(userLastPlayedTime / 6.048e+8);
            var targWeeks = Math.floor(targetLastPlayedTime / 6.048e+8);
            userPower = Math.floor(userPower);
            targetPower = Math.floor(targetPower);

            //run the random battle
            var userScore = Math.random() * userPower;
            var targetScore = Math.random() * targetPower;

            //figure out what message to report
            var outputText = text.you_Lose_Battle;
            if (userScore > targetScore) {
                outputText = text.you_Win_Battle;
                repo.recordKill(user, userKillScore, formattedTarget, utc);
            } else {
                repo.recordKill(formattedTarget, targetKillScore, user, utc);
            }

            var publicly = true;

            //send message
            this.lol.send(outputText.vars({
                $target: formattedTarget,
                $yourPower: userPower,
                $targPower: targetPower,
                $yourWeeks: userWeeks,
                $targWeeks: targWeeks
            }), publicly);
        }
    },

    'lol': {}
};
