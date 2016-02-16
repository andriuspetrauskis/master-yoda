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
    bad_server_or_username: new Text([
        'Bahaha very funny, now do it proper way!',
        'Funny it is, type your name!'
    ]),
    could_not_access_api: new Text([
        'Grumps, I cannot look at LoL servers now, please try again later'
    ]),
    account_already_linked: new Text([
        'This account is already linked\nTry `/lol status`'
    ]),
    league_free_for: new Text([
        'Well done my padawan\nI can see you are League-free for $time'
    ]),
    stopped_playing_league_ago: new Text([
        'Great job @$user, you stopped playing League $time ago'
    ]),
    user_is_not_playing_public: new Text([
        '@$user is not playing League for $time!\nYou are doing well, @$user, keep up!'
    ]),
    no_linked_accounts: new Text([
        'You have no accounts I know\nTry to `/lol link REGION account_name`'
    ]),
    top_list_header: new Text([
        'Congrats our top Jedi who are with light: \n',
        'Best Jedi known around: \n',
        'The Force is strong in these: \n',
        'Best of the best: \n'
    ]),
    top_list_footer: new Text([
        'May the force be with you!',
        'Feel the force!',
        'Do. Or do not. There is no try.',
        'Wars not make one great.',
        'Adventure. Excitement. A Jedi craves not these things.',
        'Not if anything to say about it I have',
        'Through the Force, things you will see. Other places. The future…the past. Old friends long gone.',
        'Once you start down the dark path, forever will it dominate your destiny, consume you it will.',
        'Hmm. In the end, cowards are those who follow the dark side.'
    ]),
    top_list_template: new Text([
        '#$no: @$user for $time\n',
        '#$no: @$user stopped playing $time ago\n',
        '#$no: $time on our side @$user is\n',
        '#$no: @$user is counting $time\n',
        '#$no: for $time @$user\n',
        '#$no: $time ago @$user joined us\n'
    ]),
    top_list_empty: new Text([
        'Sorry no top Jedi'
    ]),
    empty_server: new Text([
        'I understand not\nType /help'
    ]),
    unknown_server: new Text([
        'Sorry, I know no such region\nThe Empire may destroyed it'
    ]),
    help_text: new Text([
        'You can link your LoL account to this chat room to track days you quit League\n' +
        'Other users will not see your LoL username\n' +
        'Other users will see how many days ago you stopped playing\n' +
        'When you type `/lol status`\n' +
        'However, if you want to see it by yourself only, type `/lol status me`\n' +
        'To link an account you need to type `/lol link REGION summoner_name`\n' +
        'REGION - being name of server you were (hopefully) playing - na, euw, eune etc.\n' +
        'summoner_name - this is the account name others see you in game and NOT the name you login with'
    ]),
    summoner_not_found: new Text([
        'Summoner found not'
    ])
};