//popup

$('.popup').on('click', function(e){
    e.preventDefault();
    $('.popup__overlay').show();
    $('body').css('overflow', 'hidden');
});

$('.popup__close').on('click', function(e){
    $('.popup__overlay').hide();
    $('body').css('overflow', 'initial');
});

    