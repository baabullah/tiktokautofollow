var ping = null;

document.addEventListener('TriggerDisableCSP', function(e) {
	chrome.runtime.sendMessage({ message: "DisableCsp" }, function (response) {
		document.dispatchEvent(new CustomEvent('ResponseDisableCSP', {
            detail: "disableCSP" // Some variable from Gmail.
        }));
	});
});

loadScript("jquery-3.6.0.min.js", function () {
	loadScript("base.js", function () {
		setTimeout(function () {
			if (ping == null) {
				showNotification("The background script is not responding; please try restarting this page again.");
			}
		}, 2000);
		chrome.runtime.sendMessage({ message: "DisableCsp" }, function (response) {
			ping = "ping";
			console.log("Background script responded:", response);
			loadScript("inject.js", function (){
				chrome.storage.onChanged.addListener(function(changes, areaName) {
					if (areaName === "sync") {
						console.log("set foot print", changes);
						for (let key in changes) {
							localStorage.setItem(key, changes[key].newValue);								
						}
					}
				});
			});
		});		
	});
});