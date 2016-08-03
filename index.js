const {NewTabURL} = require('resource:///modules/NewTabURL.jsm');
const origin_default_tab = NewTabURL.get();

exports.main = () => {
	NewTabURL.override("resource://wlisttab/data/index.html");
}

exports.onUnload = () => {
	NewTabURL.override(origin_default_tab);
}

