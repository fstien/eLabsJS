var lab = {

	UI: {
		width: $(window).width(),
		height: $(window).height(),
		mobile: mobileCheck(),

		canvas: {
			// .width, .height and .ratio
		},
		menu: { 
			desktop: 40,
			mobile: 50
		},
		splitterSize: 50,
		control: { 
			min: 350, 
			max: 450, 
			widthSize: Math.round((Math.sqrt($(window).width()))*12)
		}
	},

}

