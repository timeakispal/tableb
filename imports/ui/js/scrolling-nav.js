//jQuery to collapse the navbar on scroll
$(window).scroll(function() {
    if ($(".w3-top").offset().top > 50) {
        $(".w3-navbar").addClass("top-nav-collapse");
    } else {
        $(".w3-navbar").removeClass("top-nav-collapse");
    }
});
