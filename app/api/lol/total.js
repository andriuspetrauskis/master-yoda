'use strict';

var text = require('../helpers/text.js');
var repo = require('../repositories/lol.js');
var moment = require('moment-precise-range');


var self = module.exports = {
    'name': 'help',
    'description': 'Show the help',

    'run': function (request) {
        this.total(request.body.text);
    },
    total: function(metric) {
        repo.getTotalTime(+moment().format('x'), +moment('2015-08-04').format('x')).then(function (savedSeconds){
            var ago = moment().subtract(savedSeconds[0].total, 'milliseconds');
            var time = self.lol.getTimeByMetric(ago, metric);
            self.lol.send(text.total_saved_time.vars('$time', time), true);
        }).catch(function(e) {
            self.lol.send(e + text.error);
        });
    },
    'lol': {}
};
