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

		/*
		var fillBox = function(index) { 
	        // Loop over the graphs and set coordinates
	        for (var i in graphArray) {
	         	// Initial height is the height of the canvas
	         	var yHeight = canvas.UI.height;
	         	// Only increment the Y coordinate for all graphs execpt for the first one
	         	for(y = 0; y <= i; y++) { 
	         		// Increment by the height of the previous graph, in order to sum the heights of all previous graphs 
	         		yHeight -= canvas.UI.width/graphArray[y].ratio;
	         	} 
	         	// Round the height
	         	yHeight = Math.round(yHeight)

			   	// Set the values on the graphs
			    graphArray[i].box.y0 = yHeight;
			   	graphArray[i].box.x0 = 0;
		        graphArray[i].box.width = canvas.UI.width;
		        graphArray[i].box.height = canvas.UI.width/graphArray[i].ratio;
	        }
	 	}
		
		if(canvas.UI.mobile) { 
			// compute the canvas height for mobile by looping over the graphs
			var canvasHeight = 0;
			for(i = 0; i < graphArray.length; i++) { 	
				canvasHeight += canvas.UI.width/graphArray[i].ratio;
			}

			canvasHeight = Math.ceil(canvasHeight)
			canvas.UI.height = canvasHeight;
			fillBox(graphArray.length)
		}
		*/

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

	}

}



// Define the graph ratio (width/height), the padding in pixes and the scalse as a proportion of the plotUnitWidth in terms of the number of units on the X-axis
function Graph(props) {
	// The width/height ratio
	this.ratio = props.ratio || 1;

	// The padding size for the plot in the box
	this.padding = props.padding || 10;

	// The scale?
	this.scale = props.scale || 1;

	// Whether or not the graph appears 
	this.visible = true;

	// Create the empty box object which will store coordinates for the box including paddings
	this.box = {};

	// Create the empty plot object which will store coordinates
	this.plot = {};

	// The default number of pixels by which the plot can overflow 
	this.plotPadding = props.padding || 4;

	// Object of elements on the 
	this.elements = {}

	// Set the default background color to white
	this.color = props.color || "white";

	// Set the default number of axes to 1
	this.axes = props.axes || 1;

	// Boolean for if the graph is being hovered
	this.hover = false;

	// The constructor name 
	this.className = arguments.callee.toString().match(/function\s+([^\s\(]+)/)[1];

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
}


Graph.prototype.hide = function() { 
	this.visible = false; 
	
	// For mobile devies, it is necessary to resize the canvas
	lab.defineVisibleGraphs();

	if(lab.UI.browser.mobile) { 
		lab.canvasResize();
	}

	lab.defineBoxes();
}

Graph.prototype.show = function() { 
	this.visible = true; 

	lab.defineVisibleGraphs();

	// For mobile devies, it is necessary to resize the canvas
	if(lab.UI.browser.mobile) { 
		lab.canvasResize();
	}

	lab.defineBoxes();
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

// Call Animation loop
window.requestAnimationFrame(drawScreen);

// The animation loop
function drawScreen() {
	// White refresh
	//ctx.clearRect(0,0,canvasVar.width,canvasVar.height);
	ctx.fillStyle = "orange";
	ctx.fillRect(0,0,canvasVar.width,canvasVar.height);

	ctx.fillStyle = "green";
	ctx.fillText("Hello World",100,50);	
	

	// Loop over the graphs to draw them
	for (var i in lab.visibleGraphs) {
		ctx.beginPath();
		ctx.fillStyle = lab.visibleGraphs[i].color;
		ctx.rect(lab.visibleGraphs[i].box.x0, lab.visibleGraphs[i].box.y0, lab.visibleGraphs[i].box.width, lab.visibleGraphs[i].box.height);
		ctx.fill()
		ctx.closePath();
	}


	window.requestAnimationFrame(drawScreen);
}

})



