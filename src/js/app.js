//= ../../node_modules/jquery/dist/jquery.min.js
//= ../../node_modules/owl.carousel/dist/owl.carousel.min.js

$(function () {
  $('.owl-carousel').owlCarousel({
    items: 1,
    loop: false,
    dots: false,
    nav: true,
    URLhashListener:true,
    startPosition: 'URLHash',
    // animateOut: 'fadeOut'
  });

  $('.owl-dots button').filter(':last').hide();
  // $('.owl-prev.disabled').
});
