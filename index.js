// CONFIG VARS : from wunderlist addon in AMO
const authBaseUrl = 'https://www.wunderlist.com/oauth/authorize';
const clientID    = 'b2638c45ac73d8a10bd7'; // todo get firefox unique
const redirectURI = 'https://a.wunderlist.com/api/health';

var local = browser.storage.local;
var wAccessToken = null;

local.get().then( data => {
	if(data.token)
		wAccessToken = data.token;
	else
		login();
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
		var logoutHandler = (tabId, changeInfo, tabInfo) => {
			if (tabInfo.url == 'https://www.wunderlist.com/download/') {
				browser.tabs.remove(tabId);
				browser.tabs.onUpdated.removeListener(logoutHandler);
			}
		};
		browser.tabs.onUpdated.addListener(logoutHandler);
    });
}

var globalObjects = {
    'addPanel': undefined,
    'addButton': undefined
};

// LOGIN URL composs
function authParams(state) {
    return {
        'client_id': clientID,
        'response_type': 'token',
        'redirect_uri': redirectURI
    };
}

function login(success, failure) {

	var getAuthUrl = state => {
		var url = authBaseUrl;
		var params = authParams(state);

		Object.keys(params)
			.forEach(function(key, index) {
				url += (index === 0 ? '?' : '&') + key + '=' + params[key];
			});

		return url;
	};

    // Open a new tab as an app tab and do something once it's open.
    var loginPage = browser.tabs.create({
        'url': getAuthUrl('foxmosa')
    }).then( () => {
		var getTokenHandler = (tabId, changeInfo, tabInfo) => {
			if ( /^https\:\/\/a\.wunderlist.com\/api\/health/.test(tabInfo.url)) {
				var url = tabInfo.url;
				console.log('tab url', url);
				var respParts = url && url.split(/\#access_token\=/);
				var token = respParts && respParts[1];

				if (token) {
					local.set({'token': token});
					// success && success();
					wAccessToken = token;
					browser.tabs.update(tabId, {
						url:"data/index.html"
					});
				} else {
					local.remove('token');
					// failure && failure();
				}
				browser.tabs.onUpdated.removeListener(getTokenHandler);
			}
		};
		browser.tabs.onUpdated.addListener(getTokenHandler);
    });
}

