(function(exports){

/***

HANDLES GLOBAL UI ELEMENTS

To Be Implemented:
- showModule
- addComponent

*/
var Layout = {

	initialize: function(config){

		this._promiseReady = new Promise();

		Loader.loadHTML(config.html).done(function(dom){
			document.getElementById("playwright").appendChild(dom);
			this._promiseReady.resolve();
			Messenger.publish("layout.Initialized");
		}.bind(this));

	},
	ready: function(callback){
		this._promiseReady.done(callback);
	},

	///// TO BE IMPLEMENTED /////
	showModule: function(module){},
	addComponent: function(dom){},
	addIframe: function(iframe){}

};

exports.Layout = Layout;

})(window);