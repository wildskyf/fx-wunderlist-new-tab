// CONFIG VARS : from wunderlist addon in AMO
const authBaseUrl = 'https://www.wunderlist.com/oauth/authorize';
const clientID    = 'b2638c45ac73d8a10bd7'; // todo get firefox unique
const redirectURI = 'https://a.wunderlist.com/api/health';

var local = browser.storage.local;
var wAccessToken = null;

var validate = url => {
	// validate the access token
	var respParts = url && url.split(/\#access_token\=/);
	var token = respParts && respParts[1];

	if (token) {
		local.set({'token': token});
		// success && success();
		wAccessToken = token;
		browser.tabs.query({
			active: true
		}).then( tabs => {
			for (let tab of tabs) {
				browser.tabs.create({
					url: "data/index.html",
					windowId: tab.windowId
				});
			}
		});
	}
	else {
		local.remove('token');
		// failure && failure();
	}
}

var authorize = () => {
	let authURL = authBaseUrl;
	authURL += `?client_id=${clientID}`;
	authURL += `&response_type=token`;
	authURL += `&redirect_uri=${encodeURIComponent(redirectURI)}`;

	return browser.identity.launchWebAuthFlow({
		interactive: true,
		url: authURL
	});
}

var login() => authorize().then(validate);

local.get().then( data => {
	wAccessToken = data.token || login();
});

// for Access request from f2e
function getToken() {
	return wAccessToken;
}

function removeToken() {
	local.remove('token');
	wAccessToken = null;
	var loginPage = browser.tabs.create({
		'url': 'https://www.wunderlist.com/logout'
	}).then( () => {
		browser.tabs.onUpdated.addListener( (tabId, changeInfo, tabInfo) => {
			if (tabInfo.url == 'https://www.wunderlist.com/download/') {
				browser.tabs.remove(tabId);
				browser.tabs.onUpdated.removeListener(arguments.callee);
			}
		});
	});
}

