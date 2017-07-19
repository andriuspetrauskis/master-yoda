"use strict";

// this is adapter for v3 riot API

var rp = require('request-promise');

module.exports = {
    'byName' : function (region, name, opts) {
        opts.success = opts.success || function (response) {
                return JSON.parse(response);
        };
        opts.fail = opts.fail || function (response) {
                throw Error('Request failed!');
        };

        return rp(this.getServerUri(region) + 'summoner/v3/summoners/by-name/' + name + this.getApiKey())
            .then(opts.success, opts.fail);
    },
    'getIdByName': function (region, name) {
        return this.byName(region, name).then(function (data) {
            return data.accountId;
        });
    },
    'lastMatches': function (region, accountId) {
        return rp(this.getServerUri(region) + 'match/v3/matchlists/by-account/' + accountId + '/recent' + this.getApiKey())
            .then(function (response) {
                return JSON.parse(response);
            });
    },
    'lastMatch': function (region, accountId) {
        return this.lastMatches(region, accountId).then(function (matches) {
            return matches[0];
        });
    },
    'getServerUri': function (region) {
        if ('undefined' === typeof this.regions[region]) {
            throw new Error("Invalid region");
        }

        return 'https://' + this.regions[region] + '.api.riotgames.com/lol/';
    },
    'getApiKey': function () {
        return '?api_key=' + process.env.API_KEY;
    },
    regions: {
        'br': 'br1',
        'eune': 'eun1',
        'euw': 'euw1',
        'jp': 'jp1',
        'kr': 'kr',
        'lan': 'la1',
        'las': 'la2',
        'na': 'na',
        'na1': 'na1',
        'oce': 'oc1',
        'tr': 'tr1',
        'ru': 'ru',
        'pbe': 'pbe1'
    }
};
