//footer-arrow-up

$('.footer_up').on('click', function(){
    e.preventDefault();
    $('html, body').animate({
        scrollTop: 0
    }, 400);
});
