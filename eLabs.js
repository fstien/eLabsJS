// Define the canvas 
var canvasVar = document.createElement('canvas');
document.getElementById('One').appendChild(canvasVar);
var ctx = canvasVar.getContext("2d");

var lab = {

	graphArray: [],

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

	visibleGraphCount: function() { 
		var graphArrayLenght = 0;
		// Count the number of graphs which are visible 
		for(var i in this.graphArray) { 
			if(this.graphArray[i].visible) { 
				graphArrayLenght += 1;
			}
		}
		return(graphArrayLenght)
	},

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

	setGraphInBox: function(i, X, Y, W, H) { 

        if ( (W/H) < this.graphArray[i].ratio ) { 
	        this.graphArray[i].box.x0 = X;
	        this.graphArray[i].box.y0 = Y + H/2 - (W/this.graphArray[i].ratio)/2;
	        this.graphArray[i].box.width = W;
	        this.graphArray[i].box.height = W/this.graphArray[i].ratio;
        }
        else { 
	        this.graphArray[i].box.x0 = X + W/2 - (H*this.graphArray[i].ratio)/2;
	        this.graphArray[i].box.y0 = Y;
	        this.graphArray[i].box.width = H*this.graphArray[i].ratio;
	        this.graphArray[i].box.height = H;
        }
	},

	defineBoxes: function() { 
		if(!lab.UI.browser.mobile) { 

			// Set the box properties for a given graph, given the coordinates of the origin, the width and height (for desktop)
			function setGraphInBox(i, X, Y, W, H) { 
		        if ( (W/H) < this.graphArray[i].ratio ) { 
			        this.graphArray[i].box.x0 = X;
			        this.graphArray[i].box.y0 = Y + H/2 - (W/this.graphArray[i].ratio)/2;
			        this.graphArray[i].box.width = W;
			        this.graphArray[i].box.height = W/this.graphArray[i].ratio;
		        }
		        else { 
			        this.graphArray[i].box.x0 = X + W/2 - (H*this.graphArray[i].ratio)/2;
			        this.graphArray[i].box.y0 = Y;
			        this.graphArray[i].box.width = H*this.graphArray[i].ratio;
			        this.graphArray[i].box.height = H;
		        }
			}

			switch(lab.visibleGraphCount()) {

			    case 1:
				    this.setGraphInBox(0, 0, 0, this.UI.canvas.width, this.UI.canvas.height)
			        break;
				

			    case 2:        
			        // If the aspect ratio of the canvas is larger than the average aspect ratios of the graphs, then stack them horizontally (side by side)
			        if (this.UI.canvas.ratio > (this.graphArray[0].ratio + this.graphArray[1].ratio)/2) { 
			        	this.setGraphInBox(0, 0, 0, canvas.UI.width/2, canvas.UI.height)
			        	this.setGraphInBox(1, canvas.UI.width/2, 0, canvas.UI.width/2, canvas.UI.height)
			        }
			        // Otherwise stack them vertically (on top of each other)
			        else { 
			        	setGraphInBox(0, 0, canvas.UI.height/2, canvas.UI.width, canvas.UI.height/2)
			        	setGraphInBox(1, 0, 0, canvas.UI.width, canvas.UI.height/2)
			        }
			        break;

			    /*
				

			    case 3:
			        // If the aspect ratio of the canvas is larger than the average aspect ratios of the graphs, then form a triangle
					if (canvas.UI.ratio > (graphArray[0].ratio + graphArray[1].ratio + graphArray[2].ratio)/3) { 
			        	setGraphInBox(0, 0, canvas.UI.height/2, canvas.UI.width, canvas.UI.height/2)
			        	setGraphInBox(1, 0, 0, canvas.UI.width/2, canvas.UI.height/2)
			        	setGraphInBox(2, canvas.UI.width/2, 0, canvas.UI.width/2, canvas.UI.height/2)
			        }
			        // Otherwise stack them vertically (on top of each other)
			        else { 
			        	setGraphInBox(0, 0, canvas.UI.height*2/3, canvas.UI.width, canvas.UI.height/3)
			        	setGraphInBox(1, 0, canvas.UI.height*1/3, canvas.UI.width, canvas.UI.height/3)
			        	setGraphInBox(2, 0, 0, canvas.UI.width, canvas.UI.height/3)
			        }
			        break;

			    case 4:
			    	// Define a grid of graphs
				    setGraphInBox(0, 0, canvas.UI.height/2, canvas.UI.width/2, canvas.UI.height/2)
			    	setGraphInBox(1, canvas.UI.width/2, canvas.UI.height/2, canvas.UI.width/2, canvas.UI.height/2)
			    	setGraphInBox(2, 0, 0, canvas.UI.width/2, canvas.UI.height/2)
			    	setGraphInBox(3, canvas.UI.width/2, 0, canvas.UI.width/2, canvas.UI.height/2)
			        break;

			    */

			    default:
			        console.log("ERROR: Number of objects in graph not between 1 and 4.")
			}





		}

	}

}



// Resize the UI elements when the desktop browser window changes size	


// Convert the canvas to a retina canvas. Call this every time the canvas is resized.



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

	
	lab.canvasResize();
	
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

lab.defineBoxes()

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
	for (var i in lab.graphArray) {

		// Backrgrount color
		ctx.beginPath();
		ctx.fillStyle = lab.graphArray[i].color;
		ctx.rect(lab.graphArray[i].box.x0, lab.graphArray[i].box.y0, lab.graphArray[i].box.width, lab.graphArray[i].box.height);
		ctx.fill()
		ctx.closePath();

	}


	window.requestAnimationFrame(drawScreen);
}

})



