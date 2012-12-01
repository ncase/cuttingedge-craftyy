(function(exports){

var Draw = {

	initialize: function(){

		// MODULE must be initialized.
		Module.initialize();

		// INPUT - what to do when someone asks for input from this Module.
		Module.input(function(){
			Draw.clearCanvas();
		});

		// INITIALIZE the drawing stuff
		Draw.canvas = document.getElementById("canvas");
		Draw.initButtons();
		Draw.initCanvas();

	},

	output: function(){
		var src = canvas.toDataURL();
		Module.output(src);
	},
	cancel: function(){
		Module.output(null);
	},

	initButtons: function(){
		document.getElementById("reset").addEventListener("click",Draw.clearCanvas);
		document.getElementById("add").addEventListener("click",Draw.output);
		document.getElementById("cancel").addEventListener("click",Draw.cancel);


		/*document.getElementById("webcam").addEventListener("click",function(){
			Edit.withModule("cam").done(function(output){
				Module.output(output);
			});
		});*/
	},

	initCanvas: function(){

		///////////////////////////
		// INIT CANVAS
		///////////////////////////

		var ctx = Draw.canvas.getContext('2d');
		var _mouseDown = false;
		var _prevX = null;
		var _prevY = null;
		var _color = "#000";
		ctx.lineCap = "round";

		Draw.clearCanvas();
		PicHistory.record();

		///////////////////////////
		// DRAW CANVAS
		///////////////////////////

		document.getElementById("colour_black").onclick = function(event){
			_color = "#000";
		};
		document.getElementById("colour_white").onclick = function(event){
			_color = "#FFF";
		};


		document.addEventListener("mousedown",function(event){
			_mouseDown = true;
		});
		document.addEventListener("mouseup",function(event){
			_mouseDown = false;
			_prevX = _prevY = null;

			PicHistory.record();

		});
		document.addEventListener("mousemove",function(event){

			if(!_mouseDown) return;
			var relativeMouse = _getRelativeMouse(event);

			if(_prevX!==null){

				ctx.strokeStyle = _color;

				// Figure out how much your mouse has moved
				var dx = _prevX-relativeMouse.x;
				var dy = _prevY-relativeMouse.y;
				var dist = Math.sqrt(dx*dx+dy*dy);

				// The faster you move, the thicker the line
				ctx.lineWidth = 3 + dist/5;
				if(ctx.lineWidth>7) ctx.lineWidth=7;

				// Draw the damn line
				ctx.beginPath();
				ctx.moveTo(_prevX,_prevY);
				ctx.lineTo(relativeMouse.x,relativeMouse.y);
				ctx.stroke();

			}
			_prevX = relativeMouse.x;
			_prevY = relativeMouse.y;

		});
		function _getRelativeMouse(event) {
		    
		    var _x = 0;
		    var _y = 0;
		    var el = canvas;
		    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
		        _x += el.offsetLeft - el.scrollLeft;
		        _y += el.offsetTop - el.scrollTop;
		        el = el.offsetParent;
		    }

		    return {
		    	x: event.pageX-_x,
		    	y: event.pageY-_y
		    };
		    
		}

	},

	clearCanvas: function(){
		var ctx = Draw.canvas.getContext('2d');
		ctx.clearRect(0,0,Draw.canvas.width,Draw.canvas.height);
	}

};

var PicHistory = {

	record: function(){
		MyHistory.record( Draw.canvas.toDataURL() );
	},

	undo: function(){
		
		var img = new Image();
		img.onload = function(){
			Draw.clearCanvas();
			var ctx = Draw.canvas.getContext('2d');
			ctx.drawImage(img,0,0);
		}
		img.src = MyHistory.undo();

	},

	redo: function(){

		var img = new Image();
		img.onload = function(){
			Draw.clearCanvas();
			var ctx = Draw.canvas.getContext('2d');
			ctx.drawImage(img,0,0);
		}
		img.src = MyHistory.redo();

	}

};

var MyHistory = {

	index: -1,
	history: [],

	record: function(data){
		if(this.index>=0){
			this.history.splice(this.index);
		}
		this.history.push(data);
		this.index++;
	},

	undo: function(){
		if(this.index>0) this.index--;
		return this.history[this.index];
	},

	redo: function(){
		if(this.index<this.history.length-1) this.index++;
		return this.history[this.index];
	}

};

// SINGLETON
exports.Draw = Draw;
exports.PicHistory = PicHistory;
Draw.initialize();

})(window);