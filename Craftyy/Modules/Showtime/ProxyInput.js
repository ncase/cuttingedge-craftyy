(function(exports){

/***

PROXY INPUT: For redirecting those tricky events

*/
var ProxyInput = {

	initialize: function(iframe){
		ProxyInput.iframe = iframe;
		_keyProxy("keydown");
		_keyProxy("keyup");
	}

};

var _keyProxy = function(TYPE){
	window.addEventListener(TYPE,function(event){

		// FUCK FIREFOX
		var eventObj = document.createEvent("KeyboardEvent");
		if(eventObj.initKeyEvent){
			eventObj.initKeyEvent(
				TYPE, true, true, window,
				0, 0, 0, 0,
				event.keyCode, event.keyCode
			);
		}else{
	        var eventObj = document.createEvent("Events");
	        eventObj.initEvent(TYPE, true, true);
	        eventObj.keyCode = event.keyCode;
	    }

        var target = ProxyInput.iframe.contentWindow;
        target.dispatchEvent(eventObj);

	});
}

// SINGLETON
exports.ProxyInput = ProxyInput;

})(window);