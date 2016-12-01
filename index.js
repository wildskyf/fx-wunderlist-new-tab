const {NewTabURL} = require('resource:///modules/NewTabURL.jsm');
const {storage} = require("sdk/simple-storage");
const tabs = require("sdk/tabs");
const prefs = require("sdk/simple-prefs");
const origin_default_tab = NewTabURL.get();

// CONFIG VARS : from wunderlist addon in AMO
const authBaseUrl = 'https://www.wunderlist.com/oauth/authorize';
const clientID    = 'b2638c45ac73d8a10bd7'; // todo get firefox unique
const redirectURI = 'https://a.wunderlist.com/api/health';

var globalObjects = {
    'addPanel': undefined,
    'addButton': undefined
};

// LOGIN URL composs
function onTokenSet(token) {
    var addPanel = globalObjects.addPanel;
    console.log('token set', storage.token);
    addPanel && addPanel.port.emit('token', storage.token);
}
 
function onLoginFailed(err) {
    var addPanel = globalObjects.addPanel;
    console.error('login failed:', err && err.message, err);
    addPanel && addPanel.port.emit('token', storage.token);
}
 
function authParams(state) {
    return {
        'client_id': clientID,
        'response_type': 'token',
        'redirect_uri': redirectURI
    };
}
 
function getAuthUrl(state) {
    var url = authBaseUrl;
    var params = authParams(state);
 
    Object.keys(params)
        .forEach(function(key, index) {
 
            url += (index === 0 ? '?' : '&') + key + '=' + params[key];
        });
 
    return url;
}

function login(success, failure) {
    // Open a new tab as an app tab and do something once it's open.
    tabs.open({
        'url': getAuthUrl('foxmosa'),
        'onOpen': function onOpen(tab) {
 
            tab.on('ready', function(tab) {
 
                var url = tab.url;
                console.log('tab url', url);
                if (url.indexOf(redirectURI) === 0) {
                    var respParts = url && url.split(/\#access_token\=/);
                    var token = respParts && respParts[1];
 
                    if (token) {
                        storage.token = token;
                        success && success();
                        onTokenSet();
                    } else {
                        delete storage.token;
                        failure && failure();
                        onLoginFailed();
                    }
 
                    tab.close();
                }
            });
        }
    });
}
 
// PREFERENCES
prefs.on('logout', function() {
    delete storage.token;
    delete storage.lastUsedListID;
    console.log('logout clicked');
});

exports.main = () => {
	login();
	NewTabURL.override("resource://wlisttab/data/index.html");
	
	// Change the new tab page. Should tell users in addon description field in AMO.
	tabs.on('open', tab => {
		if (tab.url === 'about:blank') {
			worker = tab.attach({
				contentScript: `unsafeWindow.wAccessToken = '${storage.token}';`
			});
		}
	});
};

exports.onUnload = () => {
	NewTabURL.override(origin_default_tab);
};

