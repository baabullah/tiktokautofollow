class SelfProfile {
	constructor() {

	}

	query(callback) {
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
			"referrer": "https://www.tiktok.com/@genzifm",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": null,
			"method": "GET",
			"mode": "cors",
			"credentials": "include"
		}).then((result) => { return result.json(); })
			.then((json) => {
				callback(json);
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

	followBacklog(sourceUsername) {
		console.log("followBacklog start");
		var _this = this;
		this.getBacklog(sourceUsername, function (backlog) {
			console.log("fetch backlog result", backlog);
			if (backlog.error == null) {
				if (backlog.users.length > 0) {	
					if (window.location.href == "https://www.tiktok.com/"
					|| window.location.href == "https://www.tiktok.com"
					|| window.location.href == "https://www.tiktok.com/foryou") {
						if (window.confirm("You have new friends to follow. Do it now?")) {
							window.location.href = "https://www.tiktok.com/@" + backlog.users[0].username + "?action=tofollow&targetuser=" + backlog.users[0].username + "&sourceuser=" + sourceUsername;
						}
					} else {
						if (window.location.href.indexOf("action=tofollow") != -1) {
							window.location.href = "https://www.tiktok.com/@" + backlog.users[0].username + "?action=tofollow&targetuser=" + backlog.users[0].username + "&sourceuser=" + sourceUsername;
						}							
					}										
				} else if (window.location.href.indexOf("action=tofollow") != -1) {
					alert("Awesome, no user left to follow. Check back https://www.tiktok.com/ next time to see if you can get more followers!");
				}
			}
		});
	}

	updateFollow(sourceUser, targetUser, callback) {
		var requestOptions = {
			method: 'GET',
			redirect: 'follow'
		};

		fetch("https://tiktok.baabullah.my.id/ws/follow.php?sourceuser="+sourceUser+"&targetuser=" + targetUser, requestOptions)
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
	}

	getRequestedButton() {
		var button = null;
		var buttons = document.getElementsByTagName("button");
		for (var i=0; i<buttons.length; i++) {
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
		for (var i=0; i<buttons.length; i++) {
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
		for (var i=0; i<buttons.length; i++) {
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
			setTimeout(function (){				
				_this.useCase.updateFollow(sourceUser, targetUser, function (){
					_this.useCase.followBacklog(_this.sourceUsername, function (){
						console.log("done follow backlog");
					});
				});				
			}, 5000);
		} else {
			var messagesBtn = _this.getMessagesButton();
			var requestedBtn = _this.getRequestedButton();
			if (messagesBtn != null || requestedBtn != null) {
				_this.useCase.followBacklog(_this.sourceUsername, function (){
					console.log("done follow backlog");
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
		this.selfProfile.query(function (myProfile) {
			console.log(myProfile);
			var sourceUsername = myProfile.data.username;
			var sourceUserId = myProfile.data.user_id_str;
			var sourceSecUid = myProfile.data.sec_user_id;
			_this.useCase.sync(sourceUserId, sourceUsername, sourceSecUid, function (result) {
				if (window.location.href == "https://www.tiktok.com/"
				|| window.location.href == "https://www.tiktok.com"
				|| window.location.href == "https://www.tiktok.com/foryou") {
					_this.useCase.followBacklog(sourceUsername, function (){
						console.log("done follow backlog");
					});
				} else if (window.location.href.indexOf("action=tofollow") != -1) {
					_this.sourceUsername = sourceUsername;
					_this.observeButton();					
				}
				
			});
		});
	}
}

jQuery(document).ready(
	function () {
		if (
			window.location.href.indexOf("autofollow") != -1
			|| window.location.href.indexOf("action=tofollow") != -1
			|| window.location.href == "https://www.tiktok.com/"
			|| window.location.href == "https://www.tiktok.com"
			|| window.location.href == "https://www.tiktok.com/foryou"
			) {
			const contentScript = new ContentScript();
			contentScript.init();
		}
	}
);