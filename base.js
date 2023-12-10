function ready(callback){
    // in case the document is already rendered
    if (document.readyState!='loading') callback();
    // modern browsers
    else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
    // IE <= 8
    else document.attachEvent('onreadystatechange', function(){
        if (document.readyState=='complete') callback();
    });
}

function loadScript(file, callback) {
	var s = document.createElement('script');
	s.src = chrome.runtime.getURL(file);
	s.onload = function() {
		this.remove();
		if (callback != null) {
			callback();
		}
	};
	(document.head || document.documentElement).appendChild(s);
}

function observeMonkeyPatchFetch (callback) {
    if (window.fetch.toString().indexOf("native code") != -1) {
        setTimeout(function () {
            console.log("waiting for patch");
            observeMonkeyPatchFetch(callback);
        }, 500);
    } else {
        console.log("monkey patch fetch is ready");
        setTimeout(function() {
            callback();
        }, 5000);        
    }
}

function monkeyPatchFetchReady(callback){
    observeMonkeyPatchFetch (callback);
}