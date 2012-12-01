(function(exports){

/***

AJAX: Basic XHR shtuff.

TODO: GET w/ Query String

*/
exports.ajax = {

	get: function(url){
		
		var promise = new Promise();
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET",url,true);
		xhr.addEventListener('load',function(){
			if(xhr.status === 200){
				promise.resolve(xhr.response);
			}
		},false);
		xhr.send();

		return promise;

	},

	post: function(url,params){

		var promise = new Promise();
		params = params || {};

		// REQUEST PARAMS
		var keys = Object.keys(params);
		var paramQuery = "";
		for(var i=0;i<keys.length;i++){
			
			var key = keys[i];
			var value = params[key];

			if(i!=0) paramQuery+="&";
			paramQuery += key+"="+encodeURIComponent(value);
			
		}

		// SEND REQUEST
		var xhr = new XMLHttpRequest();
		xhr.open("POST",url,true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.addEventListener('load',function(){
			if(xhr.status === 200){
				promise.resolve(xhr.response);
			}
		},false);
		xhr.send(paramQuery);

		return promise;

	}

};

})(window);