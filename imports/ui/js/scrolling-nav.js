//jQuery to collapse the navbar on scroll
$(window).scroll(function() {
	if ($(".w3-top")[0]) {
		if ($(".w3-top").offset().top > 50) {
	        $(".w3-navbar").addClass("w3-card");
	    } else {
	        $(".w3-navbar").removeClass("w3-card");
	    }
	}
    
});
