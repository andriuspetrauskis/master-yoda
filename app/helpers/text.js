'use strict';

var Text = (function () {
    var Text = function (list) {
        this.list = list;
    };
    Text.prototype = {
        toString: function () {
            return this.list[Math.floor(Math.random() * this.list.length)];
        },
        vars: function (vars, val) {
            if ('string' === typeof vars) {
                var tmp = vars;
                vars = {};
                vars[tmp] = val;
            }
            var result = this.toString();
            for (var variable in vars) {
                if (vars.hasOwnProperty(variable)) {
                    result = result.split(variable).join(vars[variable]);
                }
            }

            return result;
        }
    };
    return Text;
})();

module.exports = {
    empty_content: new Text([
        'The Slack would never do this to me...',
        'Are you hacking??'
    ]),
    hacking: new Text([
        'Are you hacking??',
        'A hacker? Or a victim? This is the question.'
    ]),
    bad_server_or_username: new Text([
        'Bahaha very funny, now try doing it the proper way!',
        'Funny it is, type your name!'
    ]),
    could_not_access_api: new Text([
        'Grumps, I cannot look at LoL servers now, please try again later'
    ]),
    account_already_linked: new Text([
        'This account is already linked\nTry `/lol status`'
    ]),
    league_free_for_linked: new Text([
        'Well done my padawan\nI can see you are League-free for $time'
    ]),
    league_free_for_short_private: new Text([
        'More I expected from you, @$user, you stopped playing League only $time ago..\n' +
        'However, me in you believe!\nYou will succeed in leaving this behind!'
    ]),
    league_free_for_average_private: new Text([
        'Great job @$user, you stopped playing League $time ago'
    ]),
    league_free_for_long_private: new Text([
        'Amazing @$user, you are sober for $time! That is to be said'
    ]),
    league_free_for_short_public: new Text([
        'A game was played by @$user $time ago.\n' +
        '@$user, this number way larger could be by now, that we all know.\n' +
        'You have been recently manipulated by evil. :sith: \nBrother, we must strive for Light!'
    ]),
    league_free_for_betweenshortandaverage_public: new Text([
        '@$user has been clear for $time.\n' +
        '@$user, you are beginning a new journey, where you determine your own destiny.\n' +
        'You are now on your own feet. :jarjar: \nMy friend, it is up to you to continue this path!'
    ]),
    league_free_for_average_public: new Text([
        '@$user has not played League for $time!\nYou are doing well, @$user, keep it up! \n A worthy apprentice you have become!\n:obiwan:'
    ]),
    league_free_for_long_public: new Text([
        '$time and counting. Amazing.\nA true Master Jedi @$user is! \n :yoda:'
    ]),
    no_linked_accounts: new Text([
        'You have no accounts I know.\nTry to `/lol link REGION account_name`'
    ]),
    top_list_header: new Text([
        'Congrats to our top Jedi, who are with Light: \n',
        'Best Jedi known around: \n',
        'The Force is strong in these Jedi: \n',
        'Best of the best: \n'
    ]),
    top_list_footer: new Text([
        'May the force be with you!',
        'Feel the force!',
        'Do. Or do not. There is no try.',
        'Wars not make one great.',
        'Adventure. Excitement. A Jedi craves not these things.',
        'Not if anything to say about it I have',
        'Through the Force, things you will see. Other places. The future… the past. Old friends long gone.',
        'Once you start down the dark path, forever will it dominate your destiny, consume you it will.',
        'Hmm. In the end, cowards are those who follow the dark side.'
    ]),
    top_list_template: new Text([
        '#$no: @$user for $time\n',
        '#$no: @$user stopped playing $time ago\n',
        '#$no: $time on our side, @$user is\n',
        '#$no: @$user is going on $time\n',
        '#$no: for $time, @$user\n',
        '#$no: $time ago, @$user quit playing\n'
    ]),
    top_list_empty: new Text([
        'Sorry no top Jedi'
    ]),
    empty_server: new Text([
        'I understand not\nType /help'
    ]),
    unknown_server: new Text([
        'Sorry, I know no such region.\nThe Empire may have destroyed it.'
    ]),
    help_text: new Text([
        'You can link your LoL account to this chat room to track the days since you quit League.\n' +
        'Other users will not see your LoL username.\n' +
        'Other users will see how many days ago you stopped playing\n' +
        'when you type `/lol status`.\n' +
        'However, if you want to see it by yourself only, type `/lol status me`.\n' +
        'To link an account, you need to type `/lol link REGION summoner_name`:\n' +
        'REGION - being name of server you were (hopefully) playing - na, euw, eune etc.\n' +
        'summoner_name - this is the account name others see you in game and NOT the name you login with'
    ]),
    summoner_not_found: new Text([
        'Summoner found not'
    ]),
    error: new Text([
        'There were an error, sorry about that'
    ]),
    total_saved_time: new Text([
        'For all players $time is saved now'
    ]),
    you_Win_Battle: new Text([
        'You won the battle against @$target! Come back later for an upgraded version of QuitLoL Battle!'
    ]),
    you_Lose_Battle: new Text([
        'You lost the battle to @$target! Thanks for playing!'
    ]),
};