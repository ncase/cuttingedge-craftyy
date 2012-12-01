(function(exports){

/****

Screenwrite: Pan & Zoom UI

*/
var EditCam = {

	initialize: function(){

		EditCam.reset();

		// Events
		News.subscribe("tick",EditCam.update);
		News.subscribe("scroll",EditCam.onScroll);
		
	},

	reset: function(){

		// Matrices
		EditCam.mtx = new Matrix2D();
		EditCam.pan = new Matrix2D();
		EditCam.zoom = new Matrix2D();

		// Helper info
		EditCam.zoomLevel = 0;
		EditCam.vel = {x:0,y:0,scroll:0};

	},

	update: function(){

		if(!Screenplay.scene) return;

		// Update matrices
		EditCam.updateScroll();
		EditCam.updatePan();

		// Deselect if moving cam
		if( Math.abs(EditCam.vel.scroll)>0.01 || Key.left||Key.right||Key.up||Key.down){
			News.publish("edit.Deselected");
		}

		// Apply matrices
		EditCam.mtx.identity();
		EditCam.mtx.appendMatrix(EditCam.pan);
		EditCam.mtx.appendMatrix(EditCam.zoom);
		EditCam.mtx.invert();
		EditCam.mtx.decompose(Screenplay.scene.art);

	},

	updateScroll: function(){

		var prevScale = Math.exp(EditCam.zoomLevel);
		EditCam.vel.scroll *= 0.5;
		EditCam.zoomLevel -= EditCam.vel.scroll;

		// Bounce
		if(EditCam.zoomLevel<-0.69){
			EditCam.zoomLevel=-0.69;
			EditCam.vel.scroll *= -0.5;
		}
		if(EditCam.zoomLevel>1.10){
			EditCam.zoomLevel=1.10;
			EditCam.vel.scroll *= -0.5;
		}

		// Zoom onto Mouse position
		var tmpMtx = new Matrix2D();
		tmpMtx.appendMatrix(EditCam.zoom);
		tmpMtx.append(1,0,0,1,Mouse.x,Mouse.y);
		var regX = tmpMtx.tx;
		var regY = tmpMtx.ty;
		var currScale = Math.exp(EditCam.zoomLevel);
		var relativeScale = currScale/prevScale;

		// Matrix
		EditCam.zoom.translate(-regX,-regY);
		EditCam.zoom.scale(relativeScale,relativeScale);
		EditCam.zoom.translate(regX,regY);

	},

	updatePan: function(){

		// TODO: CLICK & DRAG

		// Keys
		if(Key.left) EditCam.vel.x = (EditCam.vel.x-20)/2;
		if(Key.right) EditCam.vel.x = (EditCam.vel.x+20)/2;
		if(Key.up) EditCam.vel.y = (EditCam.vel.y-20)/2;
		if(Key.down) EditCam.vel.y = (EditCam.vel.y+20)/2;

		// With Inertia
		if(!Key.left && !Key.right){
			EditCam.vel.x *= 0.5;
		}
		if(!Key.up && !Key.down){
			EditCam.vel.y *= 0.5;
		}

		// Matrix
		var scale = Math.exp(EditCam.zoomLevel);
		EditCam.pan.tx += EditCam.vel.x * scale;
		EditCam.pan.ty += EditCam.vel.y * scale;

	},

	onScroll: function(event){
		EditCam.vel.scroll += event.scroll;
	}

};

//////////////////
// SINGLETON
exports.EditCam = EditCam;
News.subscribe("screenplay.Init",EditCam.initialize);

})(window);