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

	function processMessage(ele){
	  if (ele == window){return;}
	  
	  var chatimg = "";
	  try{
		   chatimg = ele.childNodes[0].querySelector("img").src;
	  } catch(e){
		  try{
		   chatimg = ele.childNodes[0].querySelector("image").href.baseVal;
		  } catch(e){
			  //
		  }
	  }
	 
	  var name = ele.childNodes[1].querySelector('a[role="link"]').innerText;
	  if (name){
		name = name.trim();
	  }
	  
	  var msg = "";
	  
	  if (textOnlyMode){
		  try {
			ele.childNodes[1].querySelector('a[role="link"]').parentNode.parentNode.parentNode.querySelector('span[lang]').querySelectorAll('*').forEach(function(node) {
				
				if (node.nodeName == "IMG"){
					//msg+=node.outerHTML;
				} else {
					node.childNodes.forEach(function(nn){
						try{
							if (nn.nodeName === "#text"){
								msg+=nn.textContent;
							}
						}catch(e){}
					});
				}
			});
		  } catch(e){
			  try{
				ele.childNodes[1].querySelector('a[role="link"]').parentNode.parentNode.parentNode.querySelectorAll('*').forEach(function(node) {
					if (node.nodeName == "IMG"){
						//msg+=node.outerHTML;
					} else {
						node.childNodes.forEach(function(nn){
							try{
								if (nn.nodeName === "#text"){
									msg+=nn.textContent;
								}
							}catch(e){}
						});
					}
				});
			  } catch(e){}
		  }
	  } else {
		  try {
			ele.childNodes[1].querySelector('a[role="link"]').parentNode.parentNode.parentNode.querySelector('span[lang]').querySelectorAll('*').forEach(function(node) {
				
				if (node.nodeName == "IMG"){
					msg+=node.outerHTML;
				} else {
					node.childNodes.forEach(function(nn){
						try{
							if (nn.nodeName === "#text"){
								msg+=nn.textContent;
							}
						}catch(e){}
					});
				}
			});
		  } catch(e){
			  try{
				ele.childNodes[1].querySelector('a[role="link"]').parentNode.parentNode.parentNode.querySelectorAll('*').forEach(function(node) {
					if (node.nodeName == "IMG"){
						msg+=node.outerHTML;
					} else {
						node.childNodes.forEach(function(nn){
							try{
								if (nn.nodeName === "#text"){
									msg+=nn.textContent;
								}
							}catch(e){}
						});
					}
				});
			  } catch(e){}
		  }
	  }
	  
	  if (msg){
		msg = msg.trim();
		if (name){
			if (msg.startsWith(name)){
				msg = msg.replace(name, '');
				msg = msg.trim();
			}
		}
	  }

	  var data = {};
	  data.chatname = name;
	  data.chatbadges = "";
	  data.backgroundColor = "";
	  data.textColor = "";
	  data.chatmessage = msg;
	  data.chatimg = chatimg;
	  data.hasDonation = "";
	  data.hasMembership = "";;
	  data.contentimg = "";
	  data.type = "facebook";
	  
	  
		if (data.chatimg){
			toDataURL(data.chatimg, function(dataUrl) {
				data.chatimg = dataUrl;
				pushMessage(data);
			});
		} else {
			data.chatimg = "";
			pushMessage(data);
		}
	  
	}
	setTimeout(function(){ // clear existing messages; just too much for a stream.
		try {
			var main = document.querySelector("div[role='complementary']").querySelectorAll("div[role='article']");
			for (var j =0;j<main.length;j++){
				try{
					if (!main[j].dataset.set){
						main[j].dataset.set = "true";
					} 
				} catch(e){}
			}
		} catch(e){  }
	},1600);
	
	var ttt = setInterval(function(){
		try {
			var main = document.querySelector("div[role='complementary']").querySelectorAll("div[role='article']");
			for (var j =0;j<main.length;j++){
				try{
					if (!main[j].dataset.set){
						main[j].dataset.set = "true";
						processMessage(main[j]);
					} 
				} catch(e){}
			}
		} catch(e){ }
	},2000);

	var textOnlyMode = false;
	chrome.runtime.sendMessage(chrome.runtime.id, { "getSettings": true }, function(response){  // {"state":isExtensionOn,"streamID":channel, "settings":settings}
		if ("settings" in response){
			if ("textonlymode" in response.settings){
				textOnlyMode = response.settings.textonlymode;
			}
		}
	});

	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
			try{
				if ("focusChat" == request){
					if (!document.querySelector("div[role='complementary']")){
						sendResponse(false);
						return;
					}
					var eles= document.querySelectorAll('[contenteditable="true"]');
					for (var i =0;i<eles.length;i++){
						eles[i].childNodes[0].childNodes[0].childNodes[0].focus();
					}
					sendResponse(true);
					return;
				}
				if ("textOnlyMode" == request){
					textOnlyMode = true;
					sendResponse(true);
					return;
				} else if ("richTextMode" == request){
					textOnlyMode = false;
					sendResponse(true);
					return;
				}
			} catch(e){	}
			
			sendResponse(false);
		}
	);

	
})();