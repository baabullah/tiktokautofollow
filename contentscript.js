function loadInject() {
	var s = document.createElement('script');
	s.src = chrome.runtime.getURL("WhatsappAutomation.js");
	s.onload = function() {
		this.remove();
	};
	(document.head || document.documentElement).appendChild(s);
}


	var s2 = document.createElement('script');
	s2.src = chrome.runtime.getURL('jquery-3.6.0.min.js');
	s2.onload = function() {
		loadInject();
		this.remove();
	};
	(document.head || document.documentElement).appendChild(s2);

function hidePicker(){
	jQuery("div.picker").hide();
}

function showPicker(){
	jQuery("div.picker").show();
}

function simulateTyping(text, callback) {
	const textArray = text.split('');
	let index = 0;

	function insertNextCharacter() {
		if (index < textArray.length) {
			document.execCommand('insertText', false, textArray[index]);
			index++;
			setTimeout(insertNextCharacter, 80); // Adjust the delay as needed
		} else {
			if (callback != null) {
				callback();
			}
		}
	}

	insertNextCharacter();
}

var lines = null;
var bubble = null;
var typingsound = null;
var soundpath = chrome.runtime.getURL("typing.wav");

 const event = new KeyboardEvent('keydown', {
	key: 'Enter',
	code: 'Enter',
	keyCode: 13,
	which: 13,
	bubbles: true,
});

function processAutomation() {	
	const urlParams = new URLSearchParams(window.location.search);
	bubble = jQuery('div[contenteditable="true"]')[0];
	typingsound = new Audio(soundpath);

	// Get the value of a specific query parameter
	const message = urlParams.get("message");
	if (message) {
		hidePicker();
		setTimeout(function(){
			lines = message.split("\n");
			showLines(function (){
				//showPicker();
			});
		}, 4000);
		
	}
}

function showLines(callback) {
	if (lines.length > 0) {
		var msg = lines.shift();
		typingsound.src = soundpath;
		typingsound.play();
		simulateTyping(msg, function (){
			typingsound.src = '';
			bubble.dispatchEvent(event);
			setTimeout(function () {
				showLines(callback);
			}, 2000);
		});
	} else {
		if (callback != null) {
			callback();
		}
	}
}

function main() {	
	setTimeout(processAutomation, 8000);
}

jQuery(document).ready(function () {
	main();
});