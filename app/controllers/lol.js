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
                case 'slain':
                    lol.slainUsers();
                    break;
            }
        } catch (e) {
            lol.send(e.message);
        }
    }
};
