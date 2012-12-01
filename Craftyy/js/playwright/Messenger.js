(function(exports){

/***

MESSENGER: Cross-window News.
- Instead of News, use this and it parrots it to both Windows' News.

***/

var Messenger = {

	initialize: function(){
		window.addEventListener("message", this._onMessage.bind(this), false);
	},

	connectTo: function(partner){
		this.partner = partner;
	},

	subscribe: function(type,listener){
		News.subscribe(type,listener);
	},
	
	unsubscribe: function(type,listener){
		News.unsubscribe(type,listener);
	},
	
	publish: function(type,message){
		var post = {
			type: type,
			message: message
		};
		if(this.partner) this.partner.postMessage(post,"*");
		News.publish( post.type, post.message );
	},

	_onMessage: function(event){
		var post = event.data;
		News.publish( post.type, post.message );
	}

};

// SINGLETON
exports.Messenger = Messenger;
Messenger.initialize();

})(window);