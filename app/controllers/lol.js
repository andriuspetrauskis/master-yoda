'use strict';

var lol = require('../api/lol.js');

module.exports = {
    lolAction: function (req, res) {
        try {
            lol.setOutput(res);
            lol.check(req.body);
            var parts = req.body.text.split(' ');

            var apiAction = lol.action(parts[0]);
            apiAction.run(req);

            switch (parts[0]) {
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
                case 'shield':
                    lol.shield(req.body.user_name, parts[1]);
                    break;
            }
        } catch (e) {
            lol.send(e.message);
        }
    }
};
