//header-menu

$('.header__menu a').on('click', function(e){
    e.preventDefault();

    var selector = $(this).attr('href');
    var h = $(selector);

    $('html, body').animate({
        scrollTop: h.offset().top - 190
    }, 400);
    
});
