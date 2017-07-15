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
        } catch (e) {
            lol.send(e.message);
        }
    }
};
