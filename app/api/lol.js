'use strict';

var moment = require('moment-precise-range');
var repo = require('../repositories/lol.js');
var text = require('../helpers/text.js');

var self = module.exports = {
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

    'action': function (name) {
        name = name.toLowerCase().replace(/[^\w]/g, '');
        try {
            var action = require('./lol/' + name + '.js');
            action.lol = self;
            action.run.bind(action);
        } catch (err) {
            throw Error(text.invalid_command);
        }
    },

    'shield': function (user, mode){

        if (mode === "up") {
            repo.activateShield(user).then(function(object) {
            self.send(text.shield_is_up);
        });
        } else if (mode === "down") {
            repo.deActivateShield(user).then(function(object) {
            self.send(text.shield_is_down);
        });
        } else {
            self.send(text.shield_typo);
        }

    },

    'slainUsers': function () {

        var utc = new Date().toJSON().slice(0,10);

        repo.getFoughtUsers(utc).then(function(object){

            var listedDeadUsers = object.filter(function(returnedUser){
                return returnedUser.dead;
            }).map(function(user){
                return user.name;
            });

            var listedKillers = object.filter(function(returnedUser){
                return returnedUser.points;
            }).map(function(user){
                return user.name + " with " + user.points + " victories\n";
            });

            var outputText = text.listOfDeadUsers;
            var publicly = true;

            self.send(outputText.vars({$list: listedDeadUsers, $points: listedKillers}), publicly);
        }).catch(function (e) {
            self.send(e.message);
        });

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
                    self.send(text.accident, publicly);
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
            self.send(e.message);
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
            self.send(e.message + text.error);
        });

        //fight using last played data from user and target, and respond with battle result
        function fight(userLastPlayedTime, targetLastPlayedTime) {
            //calculate odds using data
            var userPower = 12.25062252 * Math.log(userLastPlayedTime) - 225.7566385;
            var targetPower = 12.25062252 * Math.log(targetLastPlayedTime) - 225.7566385;

            //calculating weeks without playing
            var userWeeks = Math.floor(userLastPlayedTime / 6.048e+8);
            var targWeeks = Math.floor(targetLastPlayedTime / 6.048e+8);
            var userPower = Math.floor(userPower);
            var targetPower = Math.floor(targetPower);

            //run the random battle
            var userScore = Math.random() * userPower;
            var targetScore = Math.random() * targetPower;

            //figure out what message to report
            if (userScore > targetScore) {
                var outputText = text.you_Win_Battle;
                repo.recordKill(user, userKillScore, formattedTarget, utc);
            } else {
                var outputText = text.you_Lose_Battle;
                repo.recordKill(formattedTarget, targetKillScore, user, utc);
            }

            var publicly = true;

            //send message
            self.send(outputText.vars({$target: formattedTarget, $yourPower: userPower, $targPower: targetPower, $yourWeeks: userWeeks, $targWeeks: targWeeks}), publicly);
        }

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
            self.send(result, false);
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
    }
};
