var lab = {

	UI: {
		browser: { 
			width: $(window).width(),
			height: $(window).height(),
			mobile: mobileCheck(),
		},
		canvas: {
			// .width, .height and .ratio
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


}

// WHEN SCRIPT.JS IS LOADED
$(document).ready(function() { 

// Define the ctx for canvas1
var canvasVar = document.getElementById("canvasOne");
var ctx = canvasVar.getContext("2d");


lab.setCSS = function() { 
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

lab.setCSS()


// Resize the UI elements when the desktop browser window changes size	
lab.resize = function() { 

	// Override the control pane size if it is outside the boundaries
	this.UI.control.widthSize = Math.min(Math.max(this.UI.control.widthSize, this.UI.control.min), this.UI.control.max);

	// Update the browser dimensions
	this.UI.browser.height = $(window).height()
	this.UI.browser.width = $(window).width()

	// Update the this UI lab object properties and set the div sizes
	if(!this.UI.browser.mobile) { 
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

	// Tranform the lab for retina devices testing
    var oldWidth = canvasVar.width;
    var oldHeight = canvasVar.height;
    canvasVar.width = oldWidth * lab.UI.pixelRatio;
    canvasVar.height = oldHeight * lab.UI.pixelRatio;
    canvasVar.style.width = oldWidth + 'px';
    canvasVar.style.height = oldHeight + 'px';
	ctx.translate(0, 0); 
    ctx.scale(lab.UI.pixelRatio, lab.UI.pixelRatio);
    // Convert to cartesian coordinates with the retina transformation
	ctx.translate(0, canvasVar.height/lab.UI.pixelRatio); 
	ctx.scale(1,-1);
}

lab.resize()


// Call Animation loop
window.requestAnimationFrame(drawScreen);

// The animation loop
function drawScreen() {

	
	// White refresh
	//ctx.clearRect(0,0,canvasVar.width,canvasVar.height);
	ctx.fillStyle = "red";
	ctx.fillRect(0,0,canvasVar.width,canvasVar.height);

	
	
	window.requestAnimationFrame(drawScreen);
}


})



