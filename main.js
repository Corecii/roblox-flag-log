'use strict';

const apiKey = "76E5A40C-3AE1-4028-9F10-7C62520BD94F";
const cronString = '0 0 * * * *';

const axios = require('axios');
const fs = require('fs-extra');
const simplegit = require('simple-git');
const cron = require('node-cron');
const cronparser = require('cron-parser');
const sortObjectKeys = require("sort-object-keys");

function downloadJson(url, filePath, key) {
	console.log("Getting `" + url + "`...");
	return axios.get(url, {
			params: {
				apiKey: key
			}
		}).then(function(response) {
			let data = sortObjectKeys(response.data);
			let str = JSON.stringify(data, undefined, 4);
			let file = fs.openSync(filePath, 'w');
			fs.writeSync(file, str);
		})
		.catch(function(error) {
			if (error.response) {
				console.error("Error getting `" + url + "`: " + error.response.status + " (" + error.response.statusText + ")");
			} else if (error.request) {
				console.error("Error getting `" + url + "`: No response received from server");
			} else {
				console.error("Error getting `" + url + "`: Bad request: " + error.message);
			}
		})
}

let files = [
	"WindowsStudioBootstrapperSettings",
	"WindowsBootstrapperSettings",
	"MacStudioBootstrapperSettings",
	"MacBootstrapperSettings",
	"StudioAppSettings",
	"ClientSharedSettings",
	"ClientAppSettings",
	"AndroidAppSettings",
	"iOSAppSettings",
];

function saveFiles() {
	let promises = [];
	for (let fileName of files) {
		promises.push(downloadJson('https://clientsettings.api.roblox.com/Setting/QuietGet/' + fileName + '/', 'versions/' + fileName + '.json', apiKey));
	}
	return Promise.all(promises);
}


var cronInterval = cronparser.parseExpression(cronString);
function updateVersionsGit() {
	fs.ensureDirSync('versions');

	saveFiles().then(() => {
		let git = simplegit('versions');
		if (!fs.existsSync('versions/.git')) {
			git.init();
		}
		git.diff((n, diff) => {
			console.log('Changes:\n' + diff);
		});
		for (let fileName of files) {
			git.add('*');
		}
		let now = new Date().toISOString();
		git.commit(now);
		git.exec(() => {
			console.log("Done for " + now);
			console.log("Next: " + cronInterval.next().toISOString());
		});
	});
}

var task = cron.schedule(cronString, updateVersionsGit);

updateVersionsGit();
