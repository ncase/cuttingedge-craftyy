(function(exports){

/***

CONFIGURES THE WHOLE DAMN EDITOR

Logic.initialize({
	layout:{ 
		src:"layout.js" 
	},
	modules:[
		{ id:"module1", src:"module1.html" },
		{ id:"module2", src:"module2.html" }
	]
});

*/
var Logic = {

	initialize: function(config){
		
		console.log("\n== CONFIGURING ==");
		this._promiseReady = new Promise();
		
		Playwright.configure(config).done(function(){
			console.log("Running Logic!");
			this._promiseReady.resolve();
		}.bind(this));
		
	},

	ready: function(callback){
		this._promiseReady.done(callback);
	},

};

exports.Logic = Logic;

})(window);