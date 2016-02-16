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
                    lol.link(parts[1], req.body.user_name, parts[2]);
                    break;
                case 'status':
                    lol.status(req.body.user_name, parts[1]);
                    break;
                case 'top':
                    lol.top();
                    break;
                default:
                    res.send(lol.helpText);
            }
        } catch (e) {
            res.send(e.message);
        }
    }
};