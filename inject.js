class SelfProfile {
	constructor() {
		this.useCase = null;
	}

	setUseCase(useCase) {
		this.useCase = useCase;
	}

	query(callback) {
		var _this = this;
		fetch("https://www.tiktok.com/passport/web/account/info/?WebIdLastTime=1696655197&aid=1459&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F119.0.0.0%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true&device_id=7287078526422353426&device_platform=web_pc&focus_state=false&from_page=user&history_len=3&is_fullscreen=false&is_page_visible=true&os=windows&priority_region=ID&referer=&region=ID&screen_height=1080&screen_width=1920&tz_name=Asia%2FJakarta&verifyFp=verify_lppa2edt_UvapMIY4_nWU2_4MCZ_8VYa_UR6Gsa1dcU4J&webcast_language=en", {
			"headers": {
				"accept": "*/*",
				"accept-language": "en-US,en;q=0.9",
				"cache-control": "no-cache",
				"pragma": "no-cache",
				"sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin"
			},
			"referrer": "https://www.tiktok.com/@taylorswift",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": null,
			"method": "GET",
			"mode": "cors",
			"credentials": "include"
		}).then((result) => { return result.json(); })
		.then((profile) => {
			if (profile.message == "error" && profile.data.name == "session_expired") {
                localStorage.clear();
				chrome.storage.sync.clear(function() {
					var error = chrome.runtime.lastError;
					if (error) {
						console.error(error);
					} else {
						console.log('All data cleared from chrome.storage.sync');
					}
				});
			} else {
				chrome.storage.sync.get(['profile'], function (result) {
					var needSync = false;
					if (!result.hasOwnProperty('profile')) {
						needSync = true;
					} else {
						if (result.profile.data.username != profile.data.username) {
							needSync = true;
						}
					}

					if (needSync) {
						_this.useCase.sync(profile.data.user_id_str, profile.data.username, profile.data.sec_user_id, function () {
							console.log("cloud sync", profile);
							chrome.storage.sync.set({
								"profile": profile
							}, function () {
								console.log('storage set', profile);
								chrome.storage.sync.clear(function() {
									var error = chrome.runtime.lastError;
									if (error) {
										console.error(error);
									} else {
										console.log('All data cleared from chrome.storage.sync');
									}
								});
							});
						});
					} else {
						callback(profile);
					}
				});
			}
			
		});
	}
}

class UI {
	constructor() {

	}

	displaySecureUserId(secureUid) {
		if (document.getElementById("secuid") == null) {
			jQuery("body").html("<div><p id=\"secuid\">This is your secure user id: " + secureUid + "</p></div><div id=\"console\"></div>");
		} else {
			jQuery("#secuid").html(secureUid);
		}
	}

	console(log) {
		var console = document.getElementById("console");
		console.innerHTML = log + "<br/>" + console.innerHTML;
	}
}

class UseCase {
	constructor() {
		this.temp = [];
		this.ownerSecuid = null;
		this.callback = null;
	}

	sync(userid, username, secuid, callback) {
		this.callSync(userid, username, secuid, callback);
	}

	callSync(userid, username, secuid, callback) {
		var requestOptions = {
			method: 'GET',
			redirect: 'follow'
		};

		fetch("https://tiktok.baabullah.my.id/ws/sync.php?userid=" + userid + "&username=" + username + "&secuid=" + secuid, requestOptions)
			.then(response => response.json())
			.then(result => callback(result))
			.catch(error => console.log('error', error));
	}

	getParameterValue(url, paramName) {
		const urlObj = new URL(url);
		const params = new URLSearchParams(urlObj.search);
		return params.get(paramName);
	}

	setHeader(ampersand, name, url) {
		return ampersand + name + "=" + encodeURIComponent(this.getParameterValue(url, name));
	}

	getCookieValue(cookieName) {
		const name = cookieName + "=";
		const decodedCookie = decodeURIComponent(document.cookie);
		const cookieArray = decodedCookie.split(';');

		for (let i = 0; i < cookieArray.length; i++) {
			let cookie = cookieArray[i].trim();
			if (cookie.indexOf(name) == 0) {
				return cookie.substring(name.length, cookie.length);
			}
		}

		return "";
	}

	replaceUrlParameter(url, paramName, newValue) {
		// Create a URL object from the input URL string
		const urlObj = new URL(url);
	
		// Modify the specified query parameter
		urlObj.searchParams.set(paramName, newValue);
	
		// Return the modified URL as a string
		return urlObj.toString();
	}

	follow(profile, callback) {
		var _this = this;
		if (this.temp.length > 0) {
			var target = this.temp.shift();
			chrome.storage.sync.get(['header', 'url'], function (result) {
				if (result.hasOwnProperty('header') && result.hasOwnProperty('url')) {
					var header = {};
					for (var i = 0; i < result.header.length; i++) {
						header[result.header[i].name] = result.header[i].value;						
					}

					var url = _this.replaceUrlParameter(result.url, "sec_user_id", target.secuid);
					url = _this.replaceUrlParameter(url, "user_id", target.userid);
					console.log(url, header);
					window.fetch("https://www.tiktok.com/api/commit/follow/user/?WebIdLastTime=1696655197&action_type=1&aid=1988&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F119.0.0.0%20Safari%2F537.36&channel=tiktok_web&channel_id=0&cookie_enabled=true&device_id=7287078526422353426&device_platform=web_pc&focus_state=true&from=18&fromWeb=1&from_page=user&from_pre=0&history_len=3&is_fullscreen=false&is_page_visible=true&os=windows&priority_region=ID&referer=&region=ID&screen_height=1080&screen_width=1920&sec_user_id=MS4wLjABAAAAJEFYWKeAO_vvx9bK-KtcewHVQkaO23iXCdZgFVU70KP5Z9jZKN2gHhwigINx3eLN&type=1&tz_name=Asia%2FJakarta&user_id=7132124181190280194&verifyFp=verify_lpwqpqu0_aOI05V5y_RJMC_4ZMo_9eWz_Qq6AyFdpuuU6&webcast_language=en&msToken=ybbb-ThtLvAXiY8xMKm_tLuj6CNl2O-5nsIEz0_bxzlLtLCSb11H8kc6CRuVzhPy8ov_714-yUGCpXk8ASo7wW7Y-618hXtJBlcVPriH8sVVef_9pqdypIDWrLC5Oco1PUYn7K4=&X-Bogus=DFSzswVLAltANxxXtuk1U09WcBn0&_signature=_02B4Z6wo00001xdsGMgAAIDDF2wYyQD8uhMXbBxAAKC5e2", {
					"headers": {
						"accept": "*/*",
						"content-type": "application/x-www-form-urlencoded",
						"sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
						"sec-ch-ua-mobile": "?0",
						"sec-ch-ua-platform": "\"Windows\"",
						"wedus":"gombel",
						"tt-csrf-token": "9Z2J6YJ6-hfECeV0ZmFob8PBOblXAHQoUebE",
						"x-secsdk-csrf-token": "000100000001d8fc3eb9c74306d941e37a453ca01474240b26a01f0c82c9491853215404e961179f13a287a3fca1"
					},
					"referrer": "https://www.tiktok.com/@winiwmo",
					"Referrer-Policy": "same-origin",
					"host": "https://www.tiktok.com",
					"body": "",
					"method": "POST",
					"mode": "cors",
					"credentials": "include"
					}).then((result) => result.json()).then((json) => {console.log(json);});
					/*window.fetch(
						url
						, {
						"headers": header,
						"referrer": "https://www.tiktok.com/@wiramadwi",
						"referrerPolicy": "strict-origin-when-cross-origin",
						"body": "",
						"method": "POST",
						"mode": "cors",
						"credentials": "include"
					}).then((result) => result.json())
						.then((json) => {
							console.log(json);
							_this.updateFollow(profile.data.username, target.username, function () {
								_this.follow(profile, callback);
							});
						});*/

						
				} else {
					console.log("not yet do follow");
					callback();
				}
			});
		} else {
			callback();
		}
	}

	followBacklog(profile, callback) {
		console.log("followBacklog start");
		var _this = this;
		this.getBacklog(profile.data.username, function (backlog) {
			console.log("fetch backlog result", backlog);
			if (backlog.error == null) {
				if (backlog.users.length > 0) {
					// invoke follow api
					_this.temp = backlog.users;
					_this.follow(profile, function () {
						console.log("done follow");
						callback();
					});
				} else {
					console.log("no backlog");
					callback();
				}
			} else {
				callback();
			}
		});
	}

	updateFollow(sourceUser, targetUser, callback) {
		var requestOptions = {
			method: 'GET',
			redirect: 'follow'
		};

		fetch("https://tiktok.baabullah.my.id/ws/follow.php?sourceuser=" + sourceUser + "&targetuser=" + targetUser, requestOptions)
			.then(response => response.json())
			.then(result => callback(result))
			.catch(error => console.log('error', error));
	}

	getBacklog(sourceUsername, callback) {
		var requestOptions = {
			method: 'GET',
			redirect: 'follow'
		};

		fetch("https://tiktok.baabullah.my.id/ws/backlog.php?username=" + sourceUsername, requestOptions)
			.then(response => response.json())
			.then(result => callback(result))
			.catch(error => console.log('error', error));
	}

}

class ContentScript {
	constructor() {
		this.selfProfile = new SelfProfile();
		this.ui = new UI();
		this.useCase = new UseCase();
		this.sourceUsername = null;
		this.selfProfile.setUseCase(this.useCase);
	}

	getRequestedButton() {
		var button = null;
		var buttons = document.getElementsByTagName("button");
		for (var i = 0; i < buttons.length; i++) {
			if (buttons[i].textContent == "Requested") {
				button = buttons[i];
			}
		}
		console.log("button", button);
		return button;
	}

	getFollowButton() {
		var button = null;
		var buttons = document.getElementsByTagName("button");
		for (var i = 0; i < buttons.length; i++) {
			if (buttons[i].textContent == "Follow" || buttons[i].textContent == "Follow back") {
				button = buttons[i];
			}
		}
		console.log("button", button);
		return button;
	}

	getMessagesButton() {
		var button = null;
		var buttons = document.getElementsByTagName("button");
		for (var i = 0; i < buttons.length; i++) {
			if (buttons[i].textContent == "Messages") {
				button = buttons[i];
			}
		}
		console.log("button", button);
		return button;
	}

	getParameterByName(name, url = window.location.href) {
		name = name.replace(/[\[\]]/g, "\\$&");
		const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
		const results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	observeButton() {
		var _this = this;
		var button = _this.getFollowButton();
		var sourceUser = _this.getParameterByName("sourceuser");
		var targetUser = _this.getParameterByName("targetuser");
		if (button != null) {
			jQuery(button).click();
			console.log("button clicked");
			setTimeout(function () {
				_this.useCase.updateFollow(sourceUser, targetUser, function () {
					_this.useCase.followBacklog(_this.sourceUsername, function () {
						console.log("done follow backlog");
					});
				});
			}, 5000);
		} else {
			var messagesBtn = _this.getMessagesButton();
			var requestedBtn = _this.getRequestedButton();
			if (messagesBtn != null || requestedBtn != null) {
				_this.useCase.updateFollow(sourceUser, targetUser, function () {
					_this.useCase.followBacklog(_this.sourceUsername, function () {
						console.log("done follow backlog");
					});
				});
			} else {
				setTimeout(function () {
					_this.observeButton();
				}, 2500);
			}
		}
	}

	init() {
		var _this = this;
		this.selfProfile.query(function (profile) {
			console.log(profile);
			if (profile.data.username != null) {
				_this.useCase.followBacklog(profile, function () {
					console.log("done follow backlog");
				});
			} else {
				console.log("profile invalid", profile);
			}
			
			/*var sourceUsername = myProfile.data.username;
			var sourceUserId = myProfile.data.user_id_str;
			var sourceSecUid = myProfile.data.sec_user_id;
			_this.useCase.sync(sourceUserId, sourceUsername, sourceSecUid, function (result) {
				if (window.location.href == "https://www.tiktok.com/"
					|| window.location.href == "https://www.tiktok.com"
					|| window.location.href == "https://www.tiktok.com/foryou") {
					_this.useCase.followBacklog(sourceUsername, function () {
						console.log("done follow backlog");
					});
				} else if (window.location.href.indexOf("action=tofollow") != -1) {
					_this.sourceUsername = sourceUsername;
					_this.observeButton();
				}

			});*/
		});
	}
}

jQuery(document).ready(
	function () {
		if (
			window.location.href == "https://www.tiktok.com/"
			|| window.location.href == "https://www.tiktok.com"
			|| window.location.href.indexOf("https://www.tiktok.com/foryou") != -1
		) {
			const contentScript = new ContentScript();
			setTimeout(function() {
				contentScript.init();
			}, 10000);
			
		}
	}
);

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
/*
loadScript("jquery-3.6.0.min.js", function () {
	loadScript("inject.js");
});
*/
