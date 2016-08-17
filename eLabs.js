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
			$("#One").height(this.UI.browser.height)
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
			// Set the NavBar height for mobile
			$(".navbar").height(this.UI.menu.desktop)
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

	// Whether or not the graph appears 
	this.visible = false;

	// Boolean for if the graph is being hovered
	this.hover = false;

	// The constructor name 
	this.className = arguments.callee.toString().match(/function\s+([^\s\(]+)/)[1];

	this.arrayIndex = lab.graphArray.length;

	// Add the graph to the lab graphArray
	lab.graphArray.push(this);
}

Graph.prototype.setBox = function() { 
	

}

// WHEN SCRIPT.JS IS LOADED
$(document).ready(function() { 

// Define the ctx for canvas1
var canvasVar = document.getElementById("canvasOne");
var ctx = canvasVar.getContext("2d");

// compute the constant ratio to scale the canvas with
var devicePixelRatio = window.devicePixelRatio || 1;
// determine the backing store ratio
var backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio ||ctx.backingStorePixelRatio || 1;
lab.UI.pixelRatio = (devicePixelRatio/backingStoreRatio)*1;

// Apply different CSS properties depending on whether the device is mobile
lab.setCSS()

// Convert the canvas to a retina canvas. Call this every time the canvas is resized.
lab.retinaTransform = function() { 
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
}

// Resize the UI elements when the desktop browser window changes size	
lab.canvasResize = function() { 
	// Override the control pane size if it is outside the boundaries
	this.UI.control.widthSize = Math.min(Math.max(this.UI.control.widthSize, this.UI.control.min), this.UI.control.max);
	// Update the browser dimensions
	this.UI.browser.height = $(window).height()
	this.UI.browser.width = $(window).width()
	// Update the this UI lab object properties and set the div sizes
	if(this.UI.browser.mobile) { 
		this.UI.canvas.height = this.UI.browser.height;
		this.UI.canvas.width = this.UI.browser.width;
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
		$("#splitter").width(this.UI.splitterSize)
		$("#Two").height(this.UI.canvas.height)
		$("#Two").width(this.UI.control.widthSize)
	}
	// Set the lab width and height
	canvasVar.height = this.UI.canvas.height;
	canvasVar.width = this.UI.canvas.width;

	// Apply retina transformation
	this.retinaTransform();
}

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
	



	window.requestAnimationFrame(drawScreen);
}

})



