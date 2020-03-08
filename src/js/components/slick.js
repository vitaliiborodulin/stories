//slider

$('.slider').slick({
    arrows: true,
	slidesToShow: 1,
	slidesToScroll: 1,
	prevArrow: '<div class="slider-arrow slider-arrow--left"></div>',
	nextArrow: '<div class="slider-arrow slider-arrow--right"></div>',
	responsive: [
		{
		  breakpoint: 700,
		  settings: {
			dots: true
		  }
		}
	]
});