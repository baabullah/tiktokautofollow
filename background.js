class CspManager {
	constructor() {

	}

	disable(id) {
		try {
			let addRules = [];
			let removeRuleIds = [];

			addRules.push({
				id,
				action: {
					type: 'modifyHeaders',
					responseHeaders: [{ header: 'Content-Security-Policy', operation: 'set', value: '' }]
				},
				condition: { urlFilter: "|https*", resourceTypes: ['main_frame', 'sub_frame'] }
			})

			chrome.browsingData.remove({}, { serviceWorkers: true }, () => { })
			chrome.declarativeNetRequest.updateSessionRules({ addRules, removeRuleIds });
		} catch (e) {

		}		
	}
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      console.log("Request headers:", details);
      var param = {};
      for (var i=0; i<details.requestHeaders.length; i++) {
        param[details.requestHeaders[i].name] = details.requestHeaders[i].value;
      }
      param['url'] = details.url;
      chrome.storage.sync.set(param, function() {
        console.log('Value is set', param);
      });
    },
    { urls: ["https://www.tiktok.com/api/commit/follow/user/*action_type=1*"] },
    ["requestHeaders"]
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == "DisableCsp") {
    var cspManager = new CspManager();
    cspManager.disable(sender.tab.id);
		sendResponse({ message: "CSP is now disabled" });
  }
});