// This is update file, be sure to run periodically e.g. each hour.
'use strict';

var rp = require('request-promise');
var repo = require('./app/repositories/lol.js');

console.log('starting update');

repo.getLeastCheckedSummoners().then(function (documents) {
    var limit = 40; // how much summoner ids we can pass in one request
    var requestPool = [];
    documents.forEach(function (document) {
        for (var offset = 0; offset < document.ids.length; offset += limit) {
            var requests = requestPool.push(rp(
                {
                    uri: 'https://' + document._id + '.api.pvp.net/api/lol/' + document._id +
                    '/v1.4/summoner/' + document.ids.slice(offset, offset + limit).join(',') +
                    '?api_key=' + process.env.LOL_KEY,
                    transform: function (body) {
                        var data = JSON.parse(body);
                        data['server'] = document._id;
                        return data;
                    }
                }
            ));
            if (requests > 9) {
                // max requests per 10 seconds: 10
                // to do: add check if we reached api calls limit and pause afterwards
                break;
            }
        }
    });
    return Promise.all(requestPool);
}).then(function (responses) {
    var updatePool = [];
    responses.forEach(function (response) {
        for (var key in response) {
            if ('status' !== key && 'server' !== key) {
                var data = response[key];
                console.log('updating ' + key);
                updatePool.push(repo.updateSummonerDate(response.server, data.id, data.revisionDate))
            }
        }
    });
    return Promise.all(updatePool);
}, function onRequestFail(err) {
    console.error(err);
}).then(function () {
    console.log('Finished update');
    process.exit(1);
}).catch(function (err) {
    console.error(err);
    process.exit(1);
});
