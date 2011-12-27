//    Bad quickly hacked together code by revdancatt
//	revdancatt@gmail.com, use what you like
//	1337 29th Nov 2008

lave={

	canvas_obj: null,
	context: null,
	dim: {size:{w:320, h:240}, center:{x:320/2, y:240/2}},
	cubes: [],
	camera: { zoom:	240},
	counter: 0,
	counter2: 0,
	wiggle: 0,
	start_time: 0,
	report: null,
	radmod: Math.PI/180,
	do_rotate: false,
	
	go: function() {
	
		//	define the canvas and all that jazz
		this.canvas_obj = document.getElementById('obj_canvas');
		this.context = this.canvas_obj.getContext('2d');

		//	fill it in black
		this.context.fillStyle = "rgb(0,0,0)";
        this.context.strokeStyle = "rgb(255,255,255)";
        this.context.lineWidth = 1;
        this.context.translate(this.dim.center.x, this.dim.center.y);

		//	record start time foe fps
        this.start_time = new Date().getTime();
        this.report = document.getElementById('fps');
        
        //	Say that rotating is ok, just incase you want it to trigger
        //	thru some event
        this.do_rotate = true;
		lave.frame();
	},
	
	frame: function() {
	
		if (this.do_rotate) this.counter++;
		this.counter2++;
		this.wiggle+=(Math.sin(this.counter*this.radmod));
		this.cubes[0] = shapes.make_cobra(1);
				
		//	Loop thru the points of the shape plotting them onto the canvas
		for (var i=0; i < this.cubes[0].points.length; i++) {
			//	Rotate each point in turn;
			this.cubes[0].points[i] = this.rotate_point(this.cubes[0].points[i], {x:90+this.counter/4, y:this.counter/2, z:this.wiggle/5});
		}
				
        //	Paint it black
        this.context.fillRect(-this.dim.center.x, -this.dim.center.y, this.dim.size.w, this.dim.size.h);

		//	Draw the shape
		this.plot_shape(this.cubes[0]);
		
		// set up the next frame
		setTimeout('lave.frame()', 20);
		
		//	report time
		var now_time = new Date().getTime() - this.start_time;
		this.report.innerHTML = 'seconds: ' + (parseInt(now_time/10)/100) + '<br />frames: ' + this.counter2 + '<br />fps: ' + parseInt((this.counter2) / (now_time/1000));
	},
	
	// Blah blah, lazy rotate
	rotate_point: function(point, values) {
	
		var new_point = {x:0, y:0, z:0};

		values.x = values.x*this.radmod;
		values.y = values.y*this.radmod;
		values.z = values.z*this.radmod;

		new_point.x = point.x;
        new_point.y = point.y * Math.cos(values.x) - point.z * Math.sin(values.x);  //rotate about X
        new_point.z = point.y * Math.sin(values.x) + point.z * Math.cos(values.x);  //rotate about X

		point.x = parseFloat(new_point.x);
		point.z = parseFloat(new_point.z);
        new_point.x = point.z * Math.sin(values.y) + point.x * Math.cos(values.y);  //rotate about Y
        new_point.z = point.z * Math.cos(values.y) - point.x * Math.sin(values.y);  //rotate about Y

		point.x = parseFloat(new_point.x);
		point.y = parseFloat(new_point.y);
        new_point.x = point.x * Math.cos(values.z) - point.y * Math.sin(values.z);  //rotate about Y
        new_point.y = point.x * Math.sin(values.z) + point.y * Math.cos(values.z);  //rotate about Y

		return new_point;
	},

	plot_shape: function(shape) {
	
		var new_points = [];
		
		//	Loop thru the points converting them from 3D to 2D
		for (var i=0; i < shape.points.length; i++) {
			new_points.push(this.project_point(shape.points[i]));
		}

		//	Loop thru the polys plotting them
		for (var i=0; i < shape.polygons.length; i++) {
			
			var points_a = [];
			for (var j=0; j < shape.polygons[i].length; j++) {
				points_a.push(new_points[shape.polygons[i][j]]);
			}
			this.plot_poly(points_a);
		}

	},
	
	plot_point: function(point) {
	
		this.context.beginPath();
		this.context.moveTo(point.x, point.y);
		this.context.lineTo(point.x+1, point.y);
		this.context.stroke();
	
	},
	
	plot_poly: function(poly) {
	
	
		//	First of all we need to work out if the poly is 'facing' the front or not ...
		var front = ((poly[2].x - poly[0].x) * (poly[1].y - poly[2].y)) > ((poly[2].y - poly[0].y) * (poly[1].x - poly[2].x));

		if (front) {
			this.context.beginPath();
			this.context.moveTo(poly[0].x, poly[0].y);
				
			for (var i = 1; i < poly.length; i++) {
				this.context.lineTo(poly[i].x, poly[i].y);
			}
			this.context.lineTo(poly[0].x, poly[0].y);
			this.context.stroke();
		}

	},
	
	//	Function to convert a 3D point to a 2D point to be 
	//	plotted on our canvas
	project_point: function(point) {
	
		//	Make a new point with the x and y of the original point
		var f = 1 + (point.z / this.camera.zoom);
		var new_point = {
			x: (point.x * f),
			y: (point.y * f)
		}
		
		//	send the point back
		return new_point;
	}
}


//	Here is where we store all our shapes
shapes={

	//	function to make a cube of a specified dimension
	make_cube: function(width) {
		return {
			points: [
				{x:-width/2, y: width/2, z:-width/2},
				{x: width/2, y: width/2, z:-width/2},
				{x: width/2, y: width/2, z: width/2},
				{x:-width/2, y: width/2, z: width/2},
				{x:-width/2, y:-width/2, z:-width/2},
				{x: width/2, y:-width/2, z:-width/2},
				{x: width/2, y:-width/2, z: width/2},
				{x:-width/2, y:-width/2, z: width/2}
			],
			polygons: [
				[0,1,2,3],
				[3,2,6,7],
				[7,6,5,4],
				[1,0,4,5],
				[2,1,5,6],
				[0,3,7,4]
			]
		}
	},
	
	// 	making a cobra using co-ords from ...
	//	http://mackayj.doosh.net/eliteships.html
	//	(some faces needed flipping)
	make_cobra: function(scale) {
		return {
			points: [
				{x:32*scale, y:0*scale, z: 76*scale},
				{x:-32*scale, y:0*scale, z:76*scale},
				{x:0*scale, y: 26*scale, z:24*scale},
				{x:-120*scale, y: -3*scale, z:-8*scale},
				{x:120*scale, y: -3*scale, z:-8*scale},
				{x:-88*scale, y: 16*scale, z:-40*scale},
				{x:88*scale, y: 16*scale, z:-40*scale},
				{x:128*scale, y: -8*scale, z:-40*scale},
				{x:-128*scale, y: -8*scale, z:-40*scale},
				{x:0*scale, y: 26*scale, z:-40*scale},
				{x:-32*scale, y: -24*scale, z:-40*scale},
				{x:32*scale, y: -24*scale, z:-40*scale},
				{x:-0.25*scale, y:0*scale, z:76*scale},
				{x:0*scale, y:0*scale, z:86*scale},
				{x:0.25*scale, y:0*scale, z:76*scale},
				{x:-36*scale, y:8*scale, z:-40*scale},
				{x:-8*scale, y:12*scale, z:-40*scale},
				{x:-8*scale, y:-16*scale, z:-40*scale},
				{x:-36*scale, y:-12*scale, z:-40*scale},
				{x:36*scale, y:8*scale, z:-40*scale},
				{x:8*scale, y:12*scale, z:-40*scale},
				{x:8*scale, y:-16*scale, z:-40*scale},
				{x:36*scale, y:-12*scale, z:-40*scale},
				{x:-80*scale, y:-6*scale, z:-40*scale},
				{x:-80*scale, y:6*scale, z:-40*scale},
				{x:-88*scale, y:0*scale, z:-40*scale},
				{x:80*scale, y:-6*scale, z:-40*scale},
				{x:80*scale, y:6*scale, z:-40*scale},
				{x:88*scale, y:0*scale, z:-40*scale}
			],
			polygons: [
				[0, 1, 2],
				[0, 11, 10, 1],
				[0, 2, 6],
				[0, 6, 4],
				[0, 4, 7, 11],
				[1, 5, 2],
				[1, 3, 5],
				[1, 10, 8, 3],
				[2, 5, 9],
				[2, 9, 6],
				[3, 8, 5],
				[4, 6, 7],
				[5, 8, 10, 11, 7, 6, 9],
				[12, 13, 14],
				[12, 14, 13],
				[15, 18, 17, 16],
				[19, 20, 21, 22],
				[23, 24, 25],
				[26, 28, 27]
			]
		}
	}
}