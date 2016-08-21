var first = new Graph({
	ratio: 1,
	color: "red",
	scaleX: 4,
	axes: 1,
})

var second = new Graph({
	ratio: 1.2,
	color: "blue",
	scaleX: 10,
})

var XPoint = new Variable({
	val: 4,
//	ease: 0.01
})

var YPoint = new Variable({
	val: 2
})

var pointTest = new Point({ 
	graph: second,
	x: XPoint,
	y: YPoint,
	width: 20,
	color: "green",
})

