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
var timer = null;
var messages = [];
function showNotification(text) {
    messages.push(text);
    showNotificationInternal();
}
function showNotificationInternal() {
    if (messages.length > 0) {
        var text = messages.shift();
        // Create the notification bar if it doesn't exist
        var bar = document.getElementById("myExtensionNotificationBar");
        if (!bar) {
            var bar = document.createElement("div");
            bar.id = "myExtensionNotificationBar";
            bar.style.position = "fixed";
            bar.style.top = "0";
            bar.style.left = "0";
            bar.style.right = "0";
            bar.style.height = "50px";
            bar.style.backgroundColor = "green";
            bar.style.color = "white";
            bar.style.textAlign = "center";
            bar.style.lineHeight = "50px";
            bar.style.zIndex = "99999999";        
            document.body.prepend(bar);
        }

        bar.innerText = text;

        // Adjust the top margin of the body
        document.body.style.marginTop = "50px";

        // Hide the notification after 5 seconds
        if (timer != null) {
            timer = clearTimeout(timer);
        }
        timer = setTimeout(function() {
            document.getElementById("myExtensionNotificationBar").remove();
            document.body.style.marginTop = "0";
        }, 5000);

        setTimeout(function () {
            showNotificationInternal();
        }, 1500);
    }
    
}
