(function(exports){

// TODO: Prototype?
var Promise = function(handler){

	var _isResolved = false;
	var _handlers = [];
	var _handlerData = null;

	var _handleQueue = function(){
		var clonedHandlers = _handlers.concat();
		for(var i=0; i<clonedHandlers.length; i++){
			
			var handler = clonedHandlers[i];
			handler(_handlerData);

			// Remove from queue
			var index = _handlers.indexOf(handler);
			if(index>=0) _handlers.splice(index,1);

		}
	};

	// Call this when promise fulfilled
	this.resolve = function(data){
		_isResolved = true;
		_handlerData = data;
		_handleQueue();
	};

	// Fulfilled promise handler. TODO: .ready? chaining?
	this.done = function(handler){
		_handlers.push(handler);
		if(_isResolved) _handleQueue();
	};

	// If handler passed immediately
	if(handler) this.done(handler);

};
exports.Promise = Promise;

})(window);