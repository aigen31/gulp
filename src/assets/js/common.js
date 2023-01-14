document.addEventListener('DOMContentLoaded', () => {
  let hamburger = document.querySelector('#hamburger'),
      menu = document.querySelector('.header-main__nav-wrapper');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('is-active');
    menu.classList.toggle('active');
  })

  if (document.querySelector('.section-price__slider')) {
    portfolioSlider = new Glide('.section-price__slider', {
      perView: 1,
    })

    portfolioSlider.mount();
  }

  if (document.querySelector('.section-why__slider')) {
    whySlider = new Glide('.section-why__slider', {
      perView: 1,
    })

    whySlider.mount();
  }
})

$(function () {
  $('input[type="tel"]').inputmask({ "mask": "+7 (999) 999-9999" });

  let counterSlider = $('.section-parts__counter').slick({
    centerMode: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: false,
    infinite: false,
    asNavFor: '.section-parts__slider',
    focusOnSelect: true
  });

  let partsSlider = $('.section-parts__slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: false,
    asNavFor: '.section-parts__counter',
    prevArrow: '<button class="section-parts__arrow section-parts__arrow--left"><img src="assets/img/dist/arr-portfolio.svg" alt=""></button>',
    nextArrow: '<button class="section-parts__arrow section-parts__arrow--right"><img src="assets/img/dist/arr-portfolio.svg" alt=""></button>',
    appendArrows: '.section-parts__arrows',
    responsive: [
      {
        breakpoint: '768',
        settings: {
          centerMode: true,
          centerPadding: '40px',
          arrows: false
        }
      }
    ]
  });

  let dotsInit = () => {
    let currentSlide = $('.section-parts__counter-slide.slick-current');

    $('.section-parts__counter-slide').removeClass('slick-prev slick-next slick-over-prev slick-over-next hidden');
    currentSlide.prev().addClass('slick-prev');
    currentSlide.next().addClass('slick-next');
    currentSlide.prev().prev().addClass('slick-over-prev');
    currentSlide.next().next().addClass('slick-over-next');

    let counterSlide = $('.section-parts__counter-slide');

    counterSlide.each(function () {
      if (!$(this).hasClass('slick-prev') && !$(this).hasClass('slick-next') && !$(this).hasClass('slick-over-next') && !$(this).hasClass('slick-over-prev') && !$(this).hasClass('slick-current')) {
        $(this).addClass('hidden');
      }
    })
  }

  dotsInit();
  
  let sliders = [counterSlider, partsSlider];

  sliders.forEach((e) => {
    e.on('beforeChange', dotsInit);
    e.on('swipe', dotsInit);
  })

  $('.dropdown__header').on('click', function() {
    $(this).next().slideToggle(300);
    $(this).toggleClass('active');
  })

  if (window.matchMedia("(min-width: 576px)").matches) {
    $(window).on('scroll', function () {
      $(this).scrollTop() > $('.header-main').outerHeight() ? $('.header-main__nav-wrapper').addClass('fixed') : $('.header-main__nav-wrapper').removeClass('fixed');
    })
  }
})