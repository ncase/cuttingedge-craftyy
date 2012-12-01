(function(exports){

/***

ASSET: 
- Load array of resources & store them by ID
- Register handlers for each resource type

handler(config) => returns a promise when resource LOADED.
config: {id,type,data}

*/
var Asset = {

	initialize: function(){
		Asset.resources = {};
		Asset.manifests = [];
		Asset.handlers = {};
	},

	load: function(manifest){
		
		var newAssets = manifest.filter(function(asset){
			return( Asset.resources[asset.id]==null );
		});
		Asset.manifests = Asset.manifests.concat(newAssets);

		var promise = new Promise();
		var _resourcesLeft = newAssets.length + 1;
		var _onResourceLoad = function(){
			_resourcesLeft--;
			if(_resourcesLeft==0){
				promise.resolve();
			}
		};
		_onResourceLoad();

		for(var i=0;i<newAssets.length;i++){
			
			var config = newAssets[i];
			if(Asset.resources[config.id]){
				_onResourceLoad();
				continue;
			}

			var type = config.type;
			var handler = Asset.handlers[type];

			if(handler){
				handler(config).done(_onResourceLoad);
			}else{
				console.warn("No Asset handler for type "+type);
			}
			
		}

		return promise;

	},
	
	registerHandler: function(type,handler){
		Asset.handlers[type] = handler;
	}

};

//////////////
// SINGLETON

exports.Asset = Asset;
Asset.initialize();

})(window);