const {NewTabURL} = require('resource:///modules/NewTabURL.jsm');

exports.main = () => {
	NewTabURL.override("http://google.com");
}

exports.onUnload = () => {
	// NewTabURL.override(ogd4tab);
}

