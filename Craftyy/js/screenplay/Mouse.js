(function(exports){

var Mouse = {

	x: 0,
	y: 0,
	dx: 0,
	dy: 0,
	down: false,

	initialize: function(dom){

		// MOUSE DOWN
		dom.addEventListener("mousedown",function(event){
			Mouse.down = true;
			News.publish("mousedown",event);
			event.preventDefault();
		});

		// MOUSE MOVE
		dom.addEventListener("mousemove",function(event){
			var prevX=Mouse.x, prevY=Mouse.y;
			Mouse.x = event.pageX; // The right one?
			Mouse.y = event.pageY;
			Mouse.dx = Mouse.x-prevX;
			Mouse.dy = Mouse.y-prevY;
			News.publish("mousemove",event);
			event.preventDefault();
		});

		// MOUSE UP
		dom.addEventListener("mouseup",function(event){
			Mouse.down = false;
			News.publish("mouseup",event);
			event.preventDefault();
		});

		// SCROLL WHEEL
		dom.addEventListener("mousewheel",Mouse.onScroll,false);
		dom.addEventListener("DOMMouseScroll",Mouse.onScroll,false);

	},

	// SCROLL WHEEL
	onScroll: function(event){

		// Firefox fix
		var wheelDelta;
		if(event.wheelDelta){
			wheelDelta = event.wheelDelta;
		}else{
			wheelDelta = event.detail*-50;
		}

		// Proper scale
		var scroll = wheelDelta/1000;
		if(scroll>1) scroll=1;
		if(scroll<-1) scroll=-1;
		event.scroll = scroll;
		event.preventDefault();

		// Post!
		News.publish("scroll",event);

	}

};

// SINGLETON
exports.Mouse = Mouse;

})(window);