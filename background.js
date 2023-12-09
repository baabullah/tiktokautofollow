chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      console.log("Request headers:", details);
      chrome.storage.sync.set({
        "header" : details.requestHeaders,
        "url" : details.url
      }, function() {
        console.log('Value is set');
      });
    },
    { urls: ["https://www.tiktok.com/api/commit/follow/user/*action_type=1*"] },
    ["requestHeaders"]
  );