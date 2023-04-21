(function () {
	function pushMessage(data){	  
		try {
			chrome.runtime.sendMessage(chrome.runtime.id, { "message": data }, function(e){});
		} catch(e){}
	}

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

	async function processMessage(ele){
		console.log(ele);
		try {
		  var chatdonation = false;
		  var chatmembership = false;
		  var chatsticker = false;
		  try {
		     var chatname = ele.querySelector("b").innerText;
		  } catch(e){
			  return;
		  }
		  if (settings.textonlymode){
			  var chatmessage = ele.querySelector("span").innerText;
		  } else {
			var chatmessage = ele.querySelector("span").innerHTML;
		  }
		  
		  if (!chatmessage){
			   return;
		  }
		  var chatimg = ele.querySelector("a").style.backgroundImage.split('url("');
		  if (chatimg && chatimg.length>1){
			chatimg=chatimg[1].split(')"')[0];
			chatimg = "https://instafeed.me"+chatimg;
			
		  }

		  var data = {};
		  data.chatname = chatname;
		  data.chatbadges = "";
		  data.backgroundColor = "";
		  data.textColor = "";
		  data.chatmessage = chatmessage;
		  data.chatimg = chatimg;
		  data.hasDonation = "";
		  data.hasMembership = "";
		  data.type = "instagramlive";
		  
		    if (data.chatimg){
				toDataURL(data.chatimg, function(dataUrl) {
					data.chatimg = dataUrl;
					pushMessage(data);
				});
			} else {
				pushMessage(data);
			}
		} catch(e){
			console.error(e);
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
			try {
				if ("focusChat" == request){ // if (prev.querySelector('[id^="message-username-"]')){ //slateTextArea-
					document.querySelector('#comment_text').focus();
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

	
	function onElementInserted(target, callback) {
		var onMutationsObserved = function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.addedNodes.length) {
					for (var i = 0, len = mutation.addedNodes.length; i < len; i++) {
						console.log(mutation.addedNodes[i]);
						try {
							if (mutation.addedNodes[i].dataset.set123){continue;}
							mutation.addedNodes[i].dataset.set123 = "true";
							
							callback(mutation.addedNodes[i]);
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
	
	try {
		onElementInserted(document.getElementById("comments"), function(element){
			processMessage(element);
		});
	} catch(e){}
	

	
})();