
(function(exports){

Class.create("scene.DepthSort",{
	is:"Action",
	update: function(){
		var targetLayer = Screenplay.scene.layers.getByID("foreground"); // HACK
		targetLayer.art.children.sort(this._sort);
	},
	_sort: function(child1,child2){
		var child1 = child1.localToGlobal(0,0);
		var child2 = child2.localToGlobal(0,0);
		if(child1.y==child2.y) return( child1.x - child2.x );
		return( child1.y - child2.y );
	}
});

Class.create("scene.Camera",{
	is:"Action",
	init: function(){
		this.actor.art.visible = false;
		this.matrix = new Matrix2D();
	},
	update: function(){

		// INVERT MATRIX
		this.actor.art.getMatrix(this.matrix); // Concatenated matrix?
		this.matrix.invert();
		this.matrix.translate( Screenplay.canvas.width/2, Screenplay.canvas.height/2 );
		this.matrix.decompose(Screenplay.scene.art);

		// HACK - specific to OVERLAY
		var overlayLayer = Screenplay.scene.layers.getByID("overlay"); // HACK
		this.matrix.invert();
		this.matrix.decompose(overlayLayer.art);

	}
});

})(window);