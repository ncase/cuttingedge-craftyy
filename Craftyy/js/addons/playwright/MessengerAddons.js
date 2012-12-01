(function(exports){

/***

REQUEST HANDLING with Messenger
- request: Promises JSON-serializeable output.
- handleRequest: Handler takes one param object, returns JSON-serializeable output immediately.
- handleRequestPromise: Handler takes one param object, returns Promise.

*/

Messenger.request = function(type,params){
	
	var promise = new Promise();
	var response = type+".response"+Math.random();

	Messenger.subscribe(response,function _temp(message){
		Messenger.unsubscribe(response,_temp);
		promise.resolve(message);
	});
	
	Messenger.publish(type,{
		response: response,
		params: params
	});

	return promise;

};

Messenger.handleRequest = function(type,handler){

	Messenger.subscribe(type,function(message){

		var response = message.response;
		var params = message.params;

		Messenger.publish( response, handler(params) );
	
	});

};

Messenger.handleRequestPromise = function(type,handler){

	Messenger.subscribe(type,function(message){

		var response = message.response;
		var params = message.params;

		var promise = handler(params);
		promise.done(function(output){
			Messenger.publish(response,output);
		});
	
	});

};


})(window);