(function () {
	 
	function toDataURL(url, callback) {
	  var xhr = new XMLHttpRequest();
	  xhr.onload = function() {
		var reader = new FileReader();
		reader.onloadend = function() {
		  callback(reader.result);
		}
		reader.readAsDataURL(xhr.response);
	  };
	  xhr.open('GET', url);
	  xhr.responseType = 'blob';
	  xhr.send();
	}
	
	function processMessage(ele){
		var name="";
		try {
			name = ele.querySelector('.meeting-chat-body__header').childNodes[0].innerText;
			name = name.replace("@","");
			name = name.trim();
		} catch(e){
			name = "";
		}
		
		var msg = "";
		var skip = false;
		ele.querySelectorAll('.meeting-chat-body > div').forEach(ee=>{
			if (!skip){
				skip=true; // first node is the name
				return;
			}
			if (ee.nodeType == Node.TEXT_NODE){
				msg += ee.textContent;
				msg = msg.trim();
			} else if (!settings.textonlymode && (ee.nodeName  == "IMG")){
				msg += "<img src='"+ee.src+"' />";
				msg = msg.trim();
			}  else {
				msg += ee.textContent;
				msg = msg.trim();
			}
		});
		
		if (!msg.length){return;}
		
		var chatimg = '';
		try {
			chatimg = ele.querySelector(".ch-avatar  img[src]").src || "";
		} catch (e){}
		
		var dono = "";
		//if (ele.querySelector('.chat-history--rant-price')){
		//	dono = ele.querySelector('.chat-history--rant-price').innerText;
		//}
		
		var data = {};
		data.chatname = name;
		data.chatbadges = "";
		data.backgroundColor = "";
		data.textColor = "";
		data.chatmessage = msg;
		data.chatimg = chatimg;
		data.hasDonation = dono;
		data.hasMembership = "";;
		data.contentimg = "";
		data.type = "clouthub";
		
		pushMessage(data);
	}

	function pushMessage(data){
		try{
			chrome.runtime.sendMessage(chrome.runtime.id, { "message": data }, function(e){});
		} catch(e){
		}
	}
	
	var settings = {};
	// settings.textonlymode
	// settings.streamevents
	
	
	chrome.runtime.sendMessage(chrome.runtime.id, { "getSettings": true }, function(response){  // {"state":isExtensionOn,"streamID":channel, "settings":settings}
		if ("settings" in response){
			settings = response.settings;
		}
	});

	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
			try{
				if ("focusChat" == request){ // if (prev.querySelector('[id^="message-username-"]')){ //slateTextArea-
					document.querySelector('textarea.post-chat-input').focus();
					sendResponse(true);
					return;
				}
				if (typeof request === "object"){
					if ("settings" in request){
						settings = request.settings;
						sendResponse(true);
						return;
					}
				}
			} catch(e){}
			sendResponse(false);
		}
	);

	function onElementInserted(target) {
		var onMutationsObserved = function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.addedNodes.length) {
					for (var i = 0, len = mutation.addedNodes.length; i < len; i++) {
						try {
							if (mutation.addedNodes[i].skip){return;}
							mutation.addedNodes[i].skip = true;
							processMessage(mutation.addedNodes[i]);
						} catch(e){}
					}
				}
			});
		};
		if (!target){return;}
		var config = { childList: true, subtree: true };
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		var observer = new MutationObserver(onMutationsObserved);
		observer.observe(target, config);
	}
	
	console.log("social stream injected");

	setInterval(function(){
		if (document.querySelector('.post-chat-messages')){
			if (!document.querySelector('.post-chat-messages').marked){
				document.querySelector('.post-chat-messages').marked=true;
				onElementInserted(document.querySelector('.post-chat-messages'));
			}
		}
	},1000);

})();