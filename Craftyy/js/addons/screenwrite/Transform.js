(function(exports){

var Transform = {

	initialize: function(){
		Transform.ui = new Container();
		Screenplay.stage.addChild(Transform.ui);
	}

};

//////////////////
// SINGLETON
exports.Transform = Transform;
News.subscribe("screenplay.Init",Transform.initialize);

})(window);