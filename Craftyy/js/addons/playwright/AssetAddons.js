(function(exports){

//////////////////
// UNPACKAGE: Get all contents of a package, recursively.

Asset.unpackage = function(assets){

	var promise = new Promise();
	var output = [];

	// Get all packages in these assets
	var packages = assets.filter(function(config){
		var id = config.id;
		return( id.indexOf("package.")==0 );
	});

	// Add everything else to the array
	var others = assets.filter(function(config){
		return( packages.indexOf(config)<0 );
	});
	output = output.concat(others);

	// No packages? DONE!
	var _packagesLeft = packages.length;
	if(_packagesLeft==0){
		promise.resolve(output);
		return promise;
	}

	// On Package Load
	var _onPackageLoaded = function(projectJSON){

		projectJSON = JSON.parse(projectJSON);
		Asset.unpackage(projectJSON.assets).done(function(subAssets){

			output = output.concat(subAssets);
			_packagesLeft--;
			if(_packagesLeft==0){
				promise.resolve(output);
			}

		});

	};

	// Recursively unpackage all packages, and add their contents
	for(var i=0; i<packages.length; i++){
		ajax.get(packages[i].data).done(_onPackageLoaded);
	}

	return promise;
	
};

//////////////////
// TAG SEARCH

Asset.hasTag = function(assets,tag){
	return assets.filter(function(asset){
		return( asset.tags.indexOf(tag) >= 0 );
	});
};
Asset.hasAnyTag = function(assets,tags){
	return assets.filter(function(asset){
		for(var i=0;i<tags.length;i++){
			if( asset.tags.indexOf(tags[i]) >= 0 ) return true;
		}
		return false;
	});
};
Asset.hasAllTags = function(assets,tags){
	return assets.filter(function(asset){
		for(var i=0;i<tags.length;i++){
			if( asset.tags.indexOf(tags[i]) < 0 ) return false;
		}
		return true;
	});
};


////////////////
// ID 

Asset.getByID = function(assets,id){
	
	var results = assets.filter(function(asset){
		return asset.id==id;
	});

	if(results.length==0) return null;
	return results[0];

};
Asset.generateID = function(assets,prefix){
	var uid = 0;
	while( Asset.getByID(assets,prefix+uid) ) uid++;
	return prefix+uid;
};



})(window);