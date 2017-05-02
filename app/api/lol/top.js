'use strict';

var text = require('../helpers/text.js');
var repo = require('../repositories/lol.js');
var moment = require('moment-precise-range');


module.exports = {
    'name': 'top',
    'description': 'Show top users',

    'run': function (request) {
        this.top(request.body.text);
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
            this.lol.send(result, false);
        }).catch(function () {
            this.lol.send(text.top_list_empty);
        });
    },

    'lol': {}
};
