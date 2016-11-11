var waitWACT = new Promise( done => {
	var counting = window.setInterval( () => {
		if (wAccessToken) {
			window.clearInterval(counting);
			done();
		}
	}, 100);
});
	
var wlAPI = null;
var initWL = new Promise( done => {
	waitWACT.then( () => {
		wlAPI = new wunderlist.sdk({
			'accessToken': wAccessToken,
			'clientID': 'b2638c45ac73d8a10bd7'
		});
		done();
	});
});