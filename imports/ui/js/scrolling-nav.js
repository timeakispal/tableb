//jQuery to collapse the navbar on scroll
$(window).scroll(function() {
	if ($(".w3-top")[0]) {
		if ($(".w3-top").offset().top > 50) {
			$(".w3-bar").addClass("w3-card");
			$(".w3-bar").addClass("color-base-black2");
	    } else {
			$(".w3-bar").removeClass("w3-card");
			$(".w3-bar").removeClass("color-base-black2");
	    }
	}

});
