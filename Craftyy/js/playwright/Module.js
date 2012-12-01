(function(exports){

/******

MODULE:
- To be used INSIDE the module iframe.
- Editor: input() & output()
- Additional: Focus & Blur

*/
var Module = {

	initialize: function(){
		
		Messenger.connectTo(parent.window);
		this._promiseReady = new Promise();
		this._promiseOutput = new Promise();

		// INIT on LOAD
		if(document.readyState==="complete"){
			this._promiseReady.resolve();
		}else{
			window.addEventListener("load",this._promiseReady.resolve.bind(this));
		}

		// EDIT CALL
		Messenger.handleRequestPromise("module.Edit",function(params){
			this._outputPromise = new Promise();
			this._inputCallback( params.input, params.config );
			return this._outputPromise;
		}.bind(this));

		// FOCUS
		var my = this;
		Messenger.subscribe("module.Focus",function(){ if(my._focusCallback) my._focusCallback(); });
		Messenger.subscribe("module.Blur",function(){ if(my._blurCallback) my._blurCallback(); });

	},
	
	ready: function(callback){
		this._promiseReady.done(callback);
	},

	///////////
	// IO
	input:function(callback){ this._inputCallback=callback; },
	output: function(output){ this._outputPromise.resolve(output); },

	///////////
	// FOCUS
	focus:function(callback){ this._focusCallback=callback; },
	blur:function(callback){ this._blurCallback=callback; }

};

// SINGLETON
exports.Module = Module;

})(window);