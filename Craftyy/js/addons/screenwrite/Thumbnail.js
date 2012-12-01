(function(exports){

var Thumbnail = {

	initialize: function(){

		Messenger.handleRequest("screenwrite.Thumbnail",function(){
			
			var canvas = document.createElement("canvas");
			canvas.width = 320;
			canvas.height = 180;
			
			var ctx = canvas.getContext('2d');
			ctx.fillStyle = "#FFF";
			ctx.fillRect(0,0,320,180);
			ctx.scale(0.4,0.4);
			Screenplay.scene.art.draw(ctx);

			return canvas.toDataURL();

		});

	}

};

//////////////////
// SINGLETON
exports.Thumbnail = Thumbnail;
News.subscribe("screenplay.Init",Thumbnail.initialize);

})(window);