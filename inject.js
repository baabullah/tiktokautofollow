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
		})
        .then((result) => { return result.json(); })
		.then((profile) => {
			if (profile.message == "error" && profile.data.name == "session_expired") {
                localStorage.clear();
                console.log('All data cleared from localStorage');
                callback(profile);
			} else {
                var needSync = false;
                var currentProfileUsername = localStorage.getItem("profile.username");
                
                if (currentProfileUsername == null || currentProfileUsername != profile.data.username) {
                    needSync = true;
                }

                if (needSync) {
                    _this.useCase.sync(profile.data.user_id_str, profile.data.username, profile.data.sec_user_id, function () {
                        console.log("cloud sync done", profile);
                        localStorage.setItem("profile.user_id_str", profile.data.user_id_str);
                        localStorage.setItem("profile.username", profile.data.username);
                        localStorage.setItem("profile.sec_user_id", profile.data.sec_user_id);
                        console.log('localstorate update done', profile);
                    });
                }

                callback(profile);
			}
			
		});
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

	replaceUrlParameter(url, paramName, newValue) {
		// Create a URL object from the input URL string
		const urlObj = new URL(url);
	
		// Modify the specified query parameter
		urlObj.searchParams.set(paramName, newValue);
	
		// Return the modified URL as a string
		return urlObj.toString();
	}

    constructUrl() {
        return localStorage.getItem("url");
    }

	follow(profile, callback) {
		var _this = this;
		if (this.temp.length > 0) {
            var url = this.constructUrl();
            if (url != null) {
                var target = this.temp.shift();

                url = _this.replaceUrlParameter(url, "sec_user_id", target.secuid);
                url = _this.replaceUrlParameter(url, "user_id", target.userid);
                console.log("will follow " + target.username, url);
                window.fetch(url, {
                "headers": {
                    "accept": "*/*",
                    "content-type": "application/x-www-form-urlencoded",
                    "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "wedus":"gombel"
                },
                "referrer": "https://www.tiktok.com/@winiwmo",
                "Referrer-Policy": "same-origin",
                "host": "https://www.tiktok.com",
                "body": "",
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
                })
                .then((result) => result.json())
                .then((json) => {                
                    _this.updateFollow(profile.data.username, target.username, function () {
                        if (_this.temp.length > 0) {
                            console.log("update follow done, fetch next backlog", json);
                            setTimeout(function(){
                                _this.follow(profile, callback);
                            }, 1000); 
                        } else {
                            console.log("this is the last follow for now");
                            _this.follow(profile, callback);
                        }
                                        
                    });
                });
            } else {
                console.log("no follow foot print");
                alert("Please follow some random account so we can capture the follow footprint.");
                callback();
            }
			
		} else {
            console.log("no more target to follow as of now");
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
						callback("done follow all friends");
					});
				} else {
					callback("no backlog available");
				}
			} else {
				callback("error while fetching backlog");
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
		this.useCase = new UseCase();
		this.selfProfile.setUseCase(this.useCase);
	}

	init() {
		var _this = this;
		this.selfProfile.query(function (profile) {
			console.log("Your profile", profile);
			if (profile.data.username != null) {
				_this.useCase.followBacklog(profile, function (message) {
                    console.log(message);
                });
			} else {
				console.log("looks like you are not logged in yet into the tiktok", profile);
			}
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
            monkeyPatchFetchReady(function () {
                const contentScript = new ContentScript();
                contentScript.init();
            });			
		}
	}
);