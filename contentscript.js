loadScript("jquery-3.6.0.min.js", function () {
	loadScript("base.js", function () {
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