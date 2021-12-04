const myScripts = () => {

  const testWebP = (callback) => {
    const webP = new Image();
    webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    webP.addEventListener("load", () => callback(webP.height === 2));
    webP.addEventListener("error", () => callback(webP.height === 2));
  }

  testWebP((support) => {
    const body = document.querySelector("body");
    if (support) {
      body.classList.add("webp");
    } else {
      body.classList.add("no-webp");
    }
  });

  const testimonialsSliderPhoto = new Swiper(".testimonials__slider--master", {
    loop: true,
    slidesPerView: 3,
    spaceBetween: 85,
    centeredSlides: true,
    roundLengths: true,
    navigation: {
      prevEl: ".testimonials__button--prev",
      nextEl: ".testimonials__button--next",
    },
  });

  const testimonialsSliderText = new Swiper(".testimonials__slider--slave", {
    loop: true,
    slidesPerView: "auto",
    navigation: {
      prevEl: ".testimonials__button--prev",
      nextEl: ".testimonials__button--next",
    },
  });

  testimonialsSliderPhoto.controller.control = testimonialsSliderText;
  testimonialsSliderText.controller.control = testimonialsSliderPhoto;

};

myScripts();
