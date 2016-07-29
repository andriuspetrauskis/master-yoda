'use strict';

var lol = require('../api/lol.js');

module.exports = {
    lolAction: function (req, res) {
        try {
            lol.setOutput(res);
            lol.check(req.body);
            var parts = req.body.text.split(' ');

            switch (parts[0]) {
                case 'link':
                    //user name can have spaces
                    lol.link(parts[1], req.body.user_name, parts.slice(2).join(' '));
                    break;
                case 'status':
                    lol.status(req.body.user_name, parts[1], parts[2]);
                    break;
                case 'top':
                    lol.top(parts[1]);
                    break;
                case 'total':
                    lol.total(parts[1]);
                    break;
                case 'battle':
                    lol.battle(req.body.user_name, parts[1]);
                    break;
                case 'slain':
                    lol.slainUsers();
                    break;
                default:
                    lol.help();
            }
        } catch (e) {
            lol.send(e.message);
        }
    }
};