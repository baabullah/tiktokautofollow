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