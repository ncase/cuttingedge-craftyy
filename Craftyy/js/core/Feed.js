(function(exports){

/***

FEED: Targetted message passing.
- Subscribe & unsubscribe with Callback & Target.
- Publishes messages to Callbacks applied to Targets.
- Remove all by Target

*/
var Feed = function(){
	this.initialize();
};
Feed.prototype = {
	
	initialize: function(){ this._listeners = {}; },
	destroy: function(){ this.initialize(); },

	subscribe: function(type,callback,target){

		// Initialize if needed, and store {callback,target}.
		if(typeof callback!=="function") return;
		if(this._listeners[type]===undefined){
			this._listeners[type] = [];
		}
		this._listeners[type].push({
			callback:callback,
			target:target
		});

	},
	
	unsubscribe: function(type,callback,target){

		// Type's never even been listened to.
		var subscribers = this._listeners[type];
		if(subscribers===undefined) return;

		// Find listener & target
		var index = -1;
		for( var i=0; i<subscribers.length; i++ ){
			if( subscribers[i].callback==callback && subscribers[i].target==target ){
				index = i;
				break;
			}
		}

		// Remove if found.
		if(index<0) return;
		subscribers.splice(index,1);
		if(subscribers.length==0) delete this._listeners[type];

	},
	
	publish: function(type,message){

		// For all listener types & subscribers
		if(this._listeners[type]===undefined) return;
		var subscribers = this._listeners[type].concat();
		for( var i=0; i<subscribers.length; i++ ){

			// Call callback on target
			var callback = subscribers[i].callback;
			var target = subscribers[i].target;
			callback.call(target,message);

		}

	},

	removeTarget: function(target){

		// For all listener types & subscribers
		for(var type in this._listeners){

			// Remove if target found
			var subscribers = this._listeners[type].concat();
			for( var i=0; i<subscribers.length; i++ ){
				var listener = subscribers[i];
				if(target==listener.target){
					this._listeners[type].splice( this._listeners[type].indexOf(listener), 1 );
				}
			}
			if(this._listeners[type].length==0) delete this._listeners[type];

		}

	}

};

// GLOBAL FEED
exports.Feed = Feed;
exports.News = new Feed();

})(window);