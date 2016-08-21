// Define the canvas 
var canvasVar = document.createElement('canvas');
document.getElementById('One').appendChild(canvasVar);
var ctx = canvasVar.getContext("2d");


var lab = {

	graphArray: [],

	visibleGraphs: [],

	UI: {
		browser: { 
			width: $(window).width(),
			height: $(window).height(),
			mobile: mobileCheck(),
		},
		canvas: {
			width: 0, 
			height: 0, 
			ratio: 1,

			// The padding of the plots which is shared accross Graphs
			padding: 10,
		},
		menu: { 
			desktop: 40,
			mobile: 50
		},
		splitterSize: 10,
		control: { 
			min: 350, 
			max: 450, 
			widthSize: Math.round((Math.sqrt($(window).width()))*12),
		}
	},

	defaults: { 
		color: "grey",
		width: 4,
		scaleXdefault: 10,
	},
	
	mouse: { 
	},

	setCSS: function() { 
		// Update the this UI lab object properties and set the div sizes
		if(this.UI.browser.mobile) { 
			// Set the NavBar height for mobile
			$(".navbar").height(this.UI.menu.mobile)
			// Reset the size of divs 
			$("#One").width(this.UI.browser.width)
			$("#Two").height(this.UI.browser.height)
			$("#Two").width(this.UI.browser.width)
		}
		else { 
			// Set the body height to 100% for desktop only
			$("body").height('100%')
			$("body").css("min-width", "775px")
			// Make the divs 'float' to the left so that they are side by side
			$("#One").css("float", "left")
			$("#splitter").css("float", "left")
			$("#Two").css("float", "left")
			// Set the NavBar height for desktop
			$(".navbar").height(this.UI.menu.desktop)
			// Set the splitter width
			$("#splitter").width(this.UI.splitterSize)
		}
	},

	defineVisibleGraphs: function() { 
		this.visibleGraphs = [];
		for(var i in this.graphArray) { 
			if(this.graphArray[i].visible) { 
				this.visibleGraphs.push(this.graphArray[i]);
			}
		}	

	},

	// Resize the UI elements when the desktop browser window changes size	
	canvasResize: function() { 
		// Override the control pane size if it is outside the boundaries
		this.UI.control.widthSize = Math.min(Math.max(this.UI.control.widthSize, this.UI.control.min), this.UI.control.max);
		// Update the browser dimensions
		this.UI.browser.height = $(window).height()
		this.UI.browser.width = $(window).width()
		// Update the this UI lab object properties and set the div sizes
		if(this.UI.browser.mobile) { 
			var canvasHeight = 0;
			for(var i in this.graphArray) { 
				if(this.graphArray[i].visible) { 
					canvasHeight += this.UI.browser.width/this.graphArray[i].ratio;
				}
			}
			canvasHeight = Math.ceil(canvasHeight)
			this.UI.canvas.height = canvasHeight;
			this.UI.canvas.width = this.UI.browser.width;

			$("#One").height(this.UI.canvas.height)
		}
		else {
			// Set the lab size, with the newly updated browser dimensions
			this.UI.canvas.height = this.UI.browser.height - this.UI.menu.desktop;
			this.UI.canvas.width = this.UI.browser.width - this.UI.control.widthSize - this.UI.splitterSize;
			this.UI.canvas.ratio = this.UI.canvas.width/this.UI.canvas.height
			// Reset the size of divs 
			$("#One").height(this.UI.canvas.height)
			$("#One").width(this.UI.canvas.width)
			$("#splitter").height(this.UI.canvas.height)
			$("#Two").height(this.UI.canvas.height)
			$("#Two").width(this.UI.control.widthSize)
		}
		// Set the lab width and height
		canvasVar.height = this.UI.canvas.height;
		canvasVar.width = this.UI.canvas.width;

		// Apply retina transformation
		this.retinaTransform();
		this.defineBoxes();
		this.setAllPlots();
	},

	// Convert the canvas to a retina canvas. Call this every time the canvas is resized.
	retinaTransform: function() { 
		// Tranform the lab for retina devices testing
	    var oldWidth = canvasVar.width;
	    var oldHeight = canvasVar.height;
	    canvasVar.width = oldWidth * this.UI.pixelRatio;
	    canvasVar.height = oldHeight * this.UI.pixelRatio;
	    canvasVar.style.width = oldWidth + 'px';
	    canvasVar.style.height = oldHeight + 'px';
		ctx.translate(0, 0); 
	    ctx.scale(this.UI.pixelRatio, this.UI.pixelRatio);
	    // Convert to cartesian coordinates with the retina transformation
		ctx.translate(0, canvasVar.height/this.UI.pixelRatio); 
		ctx.scale(1,-1);
	},

	// Set the box properties for a given graph, given the coordinates of the origin, the width and height (for desktop)
	setGraphInBox: function(i, X, Y, W, H) { 
        if ( (W/H) < this.visibleGraphs[i].ratio ) { 
	        this.visibleGraphs[i].box.x0 = X;
	        this.visibleGraphs[i].box.y0 = Y + H/2 - (W/this.visibleGraphs[i].ratio)/2;
	        this.visibleGraphs[i].box.width = W;
	        this.visibleGraphs[i].box.height = W/this.visibleGraphs[i].ratio;
        }
        else { 
	        this.visibleGraphs[i].box.x0 = X + W/2 - (H*this.visibleGraphs[i].ratio)/2;
	        this.visibleGraphs[i].box.y0 = Y;
	        this.visibleGraphs[i].box.width = H*this.visibleGraphs[i].ratio;
	        this.visibleGraphs[i].box.height = H;
        }
	},

	// Define the box coordinates and dimensions
	defineBoxes: function() { 
		if(lab.UI.browser.mobile) { 
			for (var i in this.visibleGraphs) {
	         	// Initial height is the height of the canvas
	         	var yHeight = this.UI.canvas.height;
	         	// Only increment the Y coordinate for all graphs execpt for the first one
	         	for(y = 0; y <= i; y++) { 
	         		// Increment by the height of the previous graph, in order to sum the heights of all previous graphs 
	         		yHeight -= this.UI.canvas.width/this.visibleGraphs[y].ratio;
	         	} 
	         	// Round the height
	         	yHeight = Math.round(yHeight)

			   	// Set the values on the graphs
			    this.visibleGraphs[i].box.y0 = yHeight;
			   	this.visibleGraphs[i].box.x0 = 0;
		        this.visibleGraphs[i].box.width = this.UI.canvas.width;
		        this.visibleGraphs[i].box.height = this.UI.canvas.width/this.visibleGraphs[i].ratio;
	        }

		}
		else { 
			switch(lab.visibleGraphs.length) {
			    case 1:
				    this.setGraphInBox(0, 0, 0, this.UI.canvas.width, this.UI.canvas.height)
			        break;

			    case 2:        
			        // If the aspect ratio of the canvas is larger than the average aspect ratios of the graphs, then stack them horizontally (side by side)
			        if(this.UI.canvas.ratio > (this.visibleGraphs[0].ratio + this.visibleGraphs[1].ratio)/2) { 
			        	this.setGraphInBox(0, 0, 0, this.UI.canvas.width/2, this.UI.canvas.height)
			        	this.setGraphInBox(1, this.UI.canvas.width/2, 0, this.UI.canvas.width/2, this.UI.canvas.height)
			        }
			        // Otherwise stack them vertically (on top of each other)
			        else { 
			        	this.setGraphInBox(0, 0, this.UI.canvas.height/2, this.UI.canvas.width, this.UI.canvas.height/2)
			        	this.setGraphInBox(1, 0, 0, this.UI.canvas.width, this.UI.canvas.height/2)
			        }
			        break;

			    case 3:
			        // If the aspect ratio of the canvas is larger than the average aspect ratios of the graphs, then form a triangle
					if (this.UI.canvas.ratio > (this.graphArray[0].ratio + this.graphArray[1].ratio + this.graphArray[2].ratio)/3) { 
			        	this.setGraphInBox(0, 0, this.UI.canvas.height/2, this.UI.canvas.width, this.UI.canvas.height/2)
			        	this.setGraphInBox(1, 0, 0, this.UI.canvas.width/2, this.UI.canvas.height/2)
			        	this.setGraphInBox(2, this.UI.canvas.width/2, 0, this.UI.canvas.width/2, this.UI.canvas.height/2)
			        }
			        // Otherwise stack them vertically (on top of each other)
			        else { 
			        	this.setGraphInBox(0, 0, this.UI.canvas.height*2/3, this.UI.canvas.width, this.UI.canvas.height/3)
			        	this.setGraphInBox(1, 0, this.UI.canvas.height*1/3, this.UI.canvas.width, this.UI.canvas.height/3)
			        	this.setGraphInBox(2, 0, 0, this.UI.canvas.width, this.UI.canvas.height/3)
			        }
			        break;
				
				
			    case 4:
			    	// Define a grid of graphs
				    this.setGraphInBox(0, 0, this.UI.canvas.height/2, this.UI.canvas.width/2, this.UI.canvas.height/2)
			    	this.setGraphInBox(1, this.UI.canvas.width/2, this.UI.canvas.height/2, this.UI.canvas.width/2, this.UI.canvas.height/2)
			    	this.setGraphInBox(2, 0, 0, this.UI.canvas.width/2, this.UI.canvas.height/2)
			    	this.setGraphInBox(3, this.UI.canvas.width/2, 0, this.UI.canvas.width/2, this.UI.canvas.height/2)
			        break;

			    default:
			        console.log("ERROR: Number of objects in graph not between 1 and 4.")
			}
		}
	}, 

	setAllPlots: function() { 
		var totalDist = 0;
		var distCount = 0
		// Compute the sum of the widths and heights of boxes and the number of sides
		for(var i in this.visibleGraphs) { 
			totalDist += this.visibleGraphs[i].box.width;
			totalDist += this.visibleGraphs[i].box.height;
			distCount += 2;
		}
		// Compute the mean
		var meanDist = totalDist/distCount;
		// Set a different padding for mobile and desktop
		this.UI.canvas.padding = this.UI.browser.mobile ? meanDist*0.12 : meanDist*0.12;
		// Define the plot as soon as the graph is defined
		for (var i in this.graphArray) {
			this.graphArray[i].setPlot();
			this.graphArray[i].setScale(this.graphArray[i].scaleX);
		}

	}

}



// Define the graph ratio (width/height), the padding in pixes and the scalse as a proportion of the plotUnit in terms of the number of units on the X-axis
function Graph(props) {
	// The width/height ratio
	this.ratio = props.ratio || 1;

	// The initial number of unit distances on the horizontal axis
	this.scaleX = props.scaleX || lab.defaults.scaleXdefault;

	// The pixel distance of a unit distance, defined in the setScale method
	this.unitPixel;

	// The number of unit distances on the vertical axis, defined in the setScale method
	this.scaleY;	

	// Whether or not the graph appears 
	this.visible = true;

	// Create the empty box object which will store coordinates for the box including paddings
	this.box = {};

	// Create the empty plot object which will store coordinates
	this.plot = {};

	// The default number of pixels by which the plot can overflow 
	this.plotPadding = props.plotPadding || 4;

	// Object of elements on the graph
	this.array = {
		Point: [],
	}

	// Set the default background color to white
	this.color = props.color || "white";

	// Set the default number of axes to 2
	this.axes = props.axes || 2, 

	// Boolean for if the graph is being hovered
	this.hover = false;

	// The constructor name 
	this.className = arguments.callee.toString().match(/function\s+([^\s\(]+)/)[1];

	// The index of the grah in graphArray !! Not in the visibleGraphs
	this.arrayIndex = lab.graphArray.length;

	// Add the graph to the lab graphArray
	lab.graphArray.push(this);
	
	// For mobile devies, it is necessary to resize the canvas
	if(lab.UI.browser.mobile) { 
		lab.canvasResize();
	}

	// Redefine the array of visible graphs
	lab.defineVisibleGraphs();

	// Redefine the boxes
	lab.defineBoxes();

	// Define the plots
	lab.setAllPlots()
}


Graph.prototype.hide = function() { 
	this.visible = false; 
	
	// For mobile devies, it is necessary to resize the canvas
	lab.defineVisibleGraphs();

	if(lab.UI.browser.mobile) { 
		lab.canvasResize();
	}

	lab.defineBoxes();
	lab.setAllPlots()
}

Graph.prototype.show = function() { 
	this.visible = true; 

	lab.defineVisibleGraphs();

	// For mobile devies, it is necessary to resize the canvas
	if(lab.UI.browser.mobile) { 
		lab.canvasResize();
	}

	lab.defineBoxes();
	lab.setAllPlots()
}

Graph.prototype.setPlot = function() {
	// Define the cartesian coordinates of the origin
	this.plot.x0 = this.box.x0 + lab.UI.canvas.padding;
	this.plot.y0 = this.box.y0 + lab.UI.canvas.padding;

	// Define the width and height of the plot
	this.plot.width = this.box.width - 2*lab.UI.canvas.padding;
	this.plot.height = this.box.height - 2*lab.UI.canvas.padding;
}

Graph.prototype.setScale = function(scale) { 
	// Set the pixel size of a unit distance
	this.unitPixel = this.plot.width/scale;
	this.scaleY = this.plot.height/this.unitPixel;	
}


// Compute the pixel X coordinate of a point distance of a graph
Graph.prototype.pixelX = function(distX) {
	return(this.plot.x0 + this.unitPixel*distX);
}

// Compute the pixel Y coordinate of a point distance of a graph
Graph.prototype.pixelY = function(distY) {
	return(this.plot.y0 + this.unitPixel*distY);
}

// Compute the distance X coordinate of a pixel of a graph
Graph.prototype.distX = function(pixelX) {
	return( (pixelX - this.plot.x0)/this.unitPixel );
}

// Compute the distance Y coordinate of a pixel of a graph
Graph.prototype.distY = function(pixelY) {
	return( (pixelY - this.plot.y0)/this.unitPixel );
}

// _________________ Variable _________________

function Variable(props) {
   this.val = props.val || 0;
   this.min = props.min || 0;
   this.max = props.max || lab.defaults.scaleXdefault;
}


// The Variable prototype
Variable.prototype = {
	// Safe way of setting a new value
	set: function(value) { 
		if(value > this.max) { 
			this.val = this.max;
		}
		else if(value < this.min) { 
			this.val = this.min;
		}
		else { 
			this.val = value;
		}
	},
	// Increment the variable
	add: function(increment) { 
		this.val = this.val + increment;
		this.val = Math.min(Math.max(this.val, this.min), this.max);
	},
   
	// Return the rounded variable
	round: function() { 
		return( Math.round(this.val) )
	},
};

Variable.prototype.update = function() { 
	this.add(closureChange);
}

// _________________ Point _________________

// The point constructor which takes Variable objects as inputs
function Point(props) { 
	this.graph = props.graph || lab.graphArray[0];
	
	
	if(props.x instanceof Variable) { 
		this.x = props.x;
	}
	else { 
		this.x = {};
		this.x.val = props.x;
	}

	if(props.y instanceof Variable) { 
		this.y = props.y;
	}
	else {  
		this.y = {};
		this.y.val = props.y;
	}
	
	this.color = props.color || lab.defaults.color;
	this.hoverColor = props.scolor || lab.defaults.color;

	this.width = props.width || lab.defaults.width;

	this.hover = false;

	this.visible = true;

	// Set the className property to the constructor function name
	this.className = arguments.callee.toString().match(/function\s+([^\s\(]+)/)[1];	

	// Push to the array of points for the chose graph object
	eval(this.graph).array[this.className].push(this);	
}



// WHEN SCRIPT.JS IS LOADED
$(document).ready(function() { 


// compute the constant ratio to scale the canvas with
var devicePixelRatio = window.devicePixelRatio || 1;
// determine the backing store ratio
var backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio ||ctx.backingStorePixelRatio || 1;
lab.UI.pixelRatio = (devicePixelRatio/backingStoreRatio)*1;

// Apply different CSS properties depending on whether the device is mobile
lab.setCSS()

// Set the initial size
lab.canvasResize()

// Define the initial boxes
lab.defineBoxes()

// Define the plots
lab.setAllPlots()

// Resize every time the window resizes.
window.addEventListener("resize", lab.canvasResize.bind(lab) );

// When the mouse moves
window.addEventListener('mousemove', function(evt) {
	lab.mouse.x = evt.x;
	lab.mouse.y = lab.UI.browser.height - evt.y;
	if(dragSwitch) { 
		lab.UI.control.widthSize = lab.UI.browser.width - lab.mouse.x - shift;
		lab.canvasResize()
	}
 })

// The code for the slider 
var shift, dragSwitch = false;
$("#splitter").mousedown(function() {
	dragSwitch = true;
	shift = lab.UI.browser.width - lab.UI.control.widthSize - lab.mouse.x
})
$("#splitter").mouseup(function() {
	dragSwitch = false;
});



Graph.prototype.drawAxes = function() { 
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 5;
	ctx.lineCap = 'round';

	//console.log(this.axes)
	switch(this.axes) { 
		case 1: 
			ctx.beginPath();
			ctx.moveTo(this.plot.x0, this.plot.y0);
			ctx.lineTo(this.plot.x0 + this.plot.width, this.plot.y0);
			ctx.stroke();
			ctx.closePath();			
			break
		case 2: 
			ctx.beginPath();
			ctx.moveTo(this.plot.x0, this.plot.y0 + this.plot.height);
			ctx.lineTo(this.plot.x0 , this.plot.y0);
			ctx.lineTo(this.plot.x0 + this.plot.width, this.plot.y0);
			ctx.stroke();
			ctx.closePath();
			break

		case 3: 
			ctx.beginPath();
			ctx.moveTo(this.plot.x0, this.plot.y0 + this.plot.height);
			ctx.lineTo(this.plot.x0 , this.plot.y0);
			ctx.lineTo(this.plot.x0 + this.plot.width, this.plot.y0);
			ctx.lineTo(this.plot.x0 + this.plot.width, this.plot.y0 + this.plot.height);
			ctx.stroke();
			ctx.closePath();
			break

		case 4: 
			ctx.beginPath();
			ctx.moveTo(this.plot.x0, this.plot.y0 + this.plot.height);
			ctx.lineTo(this.plot.x0 , this.plot.y0);
			ctx.lineTo(this.plot.x0 + this.plot.width, this.plot.y0);
			ctx.lineTo(this.plot.x0 + this.plot.width, this.plot.y0 + this.plot.height);
			ctx.lineTo(this.plot.x0, this.plot.y0 + this.plot.height);
			ctx.stroke();
			ctx.closePath();
			break

		default:
			console.log("Number of axes not in range.")
	}
}


Point.prototype.draw = function() { 
	ctx.fillStyle = this.color;

    ctx.beginPath();
	ctx.arc(this.graph.pixelX(this.x.val), this.graph.pixelY(this.y.val), this.width, 0, 2 * Math.PI, true);

	ctx.fill();
	ctx.closePath();
}



// Performance monitoring for development purposes
var stats = new Stats(); stats.showPanel( 0 ); document.body.appendChild( stats.dom );

// Call Animation loop
window.requestAnimationFrame(drawScreen);

// The animation loop
function drawScreen() {

	// Temporary
	stats.begin();

	// White refresh
	//ctx.clearRect(0,0,canvasVar.width,canvasVar.height);
	ctx.fillStyle = "orange";
	ctx.fillRect(0,0,canvasVar.width,canvasVar.height);	

	// Loop over the graphs to draw them
	for (var i in lab.visibleGraphs) {
		ctx.beginPath();
		ctx.fillStyle = lab.visibleGraphs[i].color;
		ctx.rect(lab.visibleGraphs[i].box.x0, lab.visibleGraphs[i].box.y0, lab.visibleGraphs[i].box.width, lab.visibleGraphs[i].box.height);
		ctx.fill()
		ctx.closePath();

		// Draw the plot in white 
		ctx.beginPath();
		ctx.fillStyle = "white";
		ctx.rect(lab.visibleGraphs[i].plot.x0, lab.visibleGraphs[i].plot.y0, lab.visibleGraphs[i].plot.width, lab.visibleGraphs[i].plot.height);
		ctx.fill()
		ctx.closePath();

		ctx.strokeStyle = "lightgrey";
		ctx.lineWidth = 3;
		for (j = 0; j <= lab.visibleGraphs[i].scaleX; j++) { 
		    ctx.beginPath();
			ctx.moveTo(lab.visibleGraphs[i].pixelX(j), lab.visibleGraphs[i].pixelY(0));
			ctx.lineTo(lab.visibleGraphs[i].pixelX(j), lab.visibleGraphs[i].pixelY(lab.visibleGraphs[i].scaleY));
			ctx.stroke();
		}
		for (j = 0; j <= lab.visibleGraphs[i].scaleY; j++) { 
		    ctx.beginPath();
			ctx.moveTo(lab.visibleGraphs[i].pixelX(0), lab.visibleGraphs[i].pixelY(j));
			ctx.lineTo(lab.visibleGraphs[i].pixelX(lab.visibleGraphs[i].scaleX), lab.visibleGraphs[i].pixelY(j));
			ctx.stroke();
		}
		ctx.closePath();

		lab.visibleGraphs[i].drawAxes();

	}

	XPoint.update();


	pointTest.draw()

	if(!lab.UI.browser.mobile) {  
		$("#text1").text( JSON.stringify( "X: " + lab.mouse.x ));
		$("#text2").text( JSON.stringify( "Y: " + lab.mouse.y ));
		
	}

	// Temporary
	stats.end();

	window.requestAnimationFrame(drawScreen);
}

})



