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
        'Well done my padawan\nI can see you are League-free for '
    ]),
    stopped_playing_league_ago: new Text([
        'Great job @$user, you stopped playing League '
    ]),
    user_is_not_playing_public: new Text([
        '@$user is not playing League for $time!\nYou are doing well, @$user, keep up!'
    ]),
    no_linked_accounts: new Text([
        'You have no accounts I know\nTry to `/lol link REGION account_name`'
    ]),
    top_list_header: new Text([
        'Congrats our top Jedi who are with light: \n'
    ]),
    top_list_footer: new Text([
        'May the force be with you!'
    ]),
    top_list_template: new Text([
        '#$no: @$user for $time\n'
    ]),
    top_list_empty: new Text([
        'Sorry no top Jedi'
    ]),
    empty_server: new Text([
        'I understand not\nType /help'
    ]),
    unknown_server: new Text([
        'Sorry, I know no such region\nThe Empire may destroyed it'
    ])
};