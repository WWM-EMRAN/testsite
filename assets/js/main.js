/**
* Template Name: iPortfolio
* Template URL: https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/
* Updated: Jun 29 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    document.querySelector('#header').classList.toggle('header-show');
    headerToggleBtn.classList.toggle('bi-list');
    headerToggleBtn.classList.toggle('bi-x');
  }
  headerToggleBtn.addEventListener('click', headerToggle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /* XXX */
// dropdown.addEventListener('click', function() {
//     this.classList.toggle('active');
//     this.querySelector('i').classList.toggle('rotate');
// });
//
// // Optionally add event listener for mobile touch events
// dropdown.addEventListener('touchstart', function() {
//     this.classList.toggle('active');
//     this.querySelector('i').classList.toggle('rotate');
// });

// const dropdown = document.querySelector('.dropdown-toggle');
//
// // Add event listener for both desktop and mobile (click/touch events)
// dropdown.addEventListener('click', function (event) {
//     // Toggle the 'active' class to indicate dropdown state
//     this.classList.toggle('active');
//
//     // Target the icon inside the dropdown-toggle (assuming it's the down arrow)
//     const arrowIcon = this.querySelector('i');
//
//     // Toggle the rotation of the arrow icon
//     arrowIcon.classList.toggle('rotate');
// });

  /**
   * Preloader
   */
  // const preloader = document.querySelector('#preloader');
  // if (preloader) {
  //   window.addEventListener('load', () => {
  //     preloader.remove();
  //   });
  // }

  /**
   * EA Preloader
   */
  // const eapreloader = document.querySelector('#eapreloader');
  // if (eapreloader) {
  //   const ealogo = document.getElementById("ealogo");
  //   const eapreloader = document.getElementById("eapreloader");
  //   const eamainContent = document.getElementById("main-content");
  //   ealogo.style.filter = "grayscale(0%)";
  //
  //   window.addEventListener('load', () => {
  //     eapreloader.remove();
  //   });
  // }


  // /**
  //  * My custom logo preloader
  //  */
  // // JavaScript to handle the preloader
  // // JavaScript to handle the preloader
  // window.addEventListener("load", () => {
  //   const logo = document.getElementById("logo");
  //   const preloader = document.getElementById("preloader");
  //   // const mainContent = document.getElementById("main-content");
  //
  //   // Begin color transition
  //   logo.style.filter = "grayscale(0%)";
  //
  //   // Wait for the color transition to complete, then hide preloader
  //   const computedStyle = getComputedStyle(logo);
  //   const transitionDuration = parseFloat(computedStyle.transitionDuration) * 1000; // Convert to ms
  //
  //   setTimeout(() => {
  //     preloader.style.display = "none";
  //     mainContent.style.display = "block";
  //   }, transitionDuration);
  // });

//   window.addEventListener("load", () => {
//     const logo = document.getElementById("logo");
//     const preloader = document.getElementById("preloader");
//
//     // Calculate how long the page took to load
//     const pageLoadTime = performance.now(); // in ms
//     const transitionDuration = Math.min(Math.max(pageLoadTime, 500), 3000); // Clamp between 0.5s and 3s
//
//     // Dynamically set the transition duration
//     logo.style.transition = `filter ${transitionDuration}ms ease-in-out`;
//
//     // Trigger color transition
//     logo.style.filter = "grayscale(0%)";
//
//     // Wait for transition to complete, then hide preloader
//     // setTimeout(() => {
//     //   preloader.style.display = "none";
//     //   if (typeof mainContent !== "undefined") {
//     //     mainContent.style.display = "block";
//     //   }
//     // }, transitionDuration);
//
//     setTimeout(() => {
//       preloader.classList.add("fade-out");
//       setTimeout(() => {
//         preloader.style.display = "none";
//         if (typeof mainContent !== "undefined") {
//           mainContent.style.display = "block";
//         }
//       }, 300); // match the fade duration
//     }, transitionDuration);
// });


    // window.addEventListener("load", () => {
    //   // // DEALING WITH FAV ICON ANIM
    //   // const gifFavicon = document.createElement("link");
    //   // gifFavicon.rel = "icon";
    //   // gifFavicon.type = "image/gif";
    //   // gifFavicon.href = "assets/img/Emran_Ali_Logo_Fav.gif"; // path to your animated GIF
    //   // document.head.appendChild(gifFavicon);
    //
    //   // DEALING WITH PRELOADER LOGO
    //   const logo = document.getElementById("logo");
    //   const preloader = document.getElementById("preloader");
    //
    //   // Calculate how long the page took to load
    //   const pageLoadTime = performance.now(); // in ms
    //   const transitionDuration = Math.min(Math.max(pageLoadTime, 500), 2000); // Clamp between 0.5s and 3s
    //
    //   // Determine extra delay based on page
    //   const path = window.location.pathname;
    //   const extraDelay = (path === "/" || path.endsWith("/index.html")) ? 3000 : 1000;
    //
    //   // Trigger color transition
    //   logo.style.filter = "none";
    //
    //   // Fade out preloader after color transition
    //   setTimeout(() => {
    //     preloader.style.transition = "opacity 0.6s ease";
    //     preloader.style.opacity = "0";
    //     setTimeout(() => {
    //       preloader.style.display = "none";
    //       mainContent.style.display = "flex";
    //     }, 500);
    //   }, transitionDuration+extraDelay); // Wait for filter transition to complete
    // });


    // MODIFIED: main.js (Starting around line 178 - inside the load listener)
    window.addEventListener("load", () => {
        // // DEALING WITH FAV ICON ANIM
        // const gifFavicon = document.createElement("link");
        // ... (rest of the favicon code)

        // DEALING WITH PRELOADER LOGO
        const logo = document.getElementById("logo");
        const preloader = document.getElementById("preloader");

        // CRITICAL FIX: Define mainContent using the 'main' tag selector
        const mainContent = document.querySelector('main');
        // End CRITICAL FIX

        // Calculate how long the page took to load
        const pageLoadTime = performance.now(); // in ms
        const transitionDuration = Math.min(Math.max(pageLoadTime, 500), 2000); // Clamp between 0.5s and 3s

        // Determine extra delay based on page
        const path = window.location.pathname;
        const extraDelay = (path === "/" || path.endsWith("/index.html")) ? 3000 : 1000;

        // Trigger color transition
        logo.style.filter = "none";

        // Fade out preloader after color transition
        setTimeout(() => {
            preloader.style.transition = "opacity 0.6s ease";
            preloader.style.opacity = "0";
            setTimeout(() => {
                preloader.style.display = "none";
                // // Safety check: Only set display if mainContent was found
                // if (mainContent) {
                //     mainContent.style.display = "flex";
                // }
            }, 500);
        }, transitionDuration+extraDelay); // Wait for filter transition to complete
    });





  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */

  /*
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }
   */

    // /**
    //  * Global function to initialize Typed.js animation.
    //  * This MUST be defined outside any local scopes/wrappers.
    //  */
    // function initTypedAnimation() {
    //     const selectTyped = document.querySelector('.typed');
    //
    //     // Only proceed if the element exists AND has data-typed-items defined
    //     if (selectTyped && selectTyped.getAttribute('data-typed-items')) {
    //         let typed_strings = selectTyped.getAttribute('data-typed-items');
    //         typed_strings = typed_strings.split(',');
    //
    //         // Check if the instance already exists and destroy it before creating a new one
    //         if (selectTyped.typed) {
    //             selectTyped.typed.destroy();
    //         }
    //
    //         // Initialize new Typed instance
    //         selectTyped.typed = new Typed('.typed', {
    //             strings: typed_strings,
    //             loop: true,
    //             typeSpeed: 100,
    //             backSpeed: 50,
    //             backDelay: 2000
    //         });
    //     }
    // }

// ----------------------------------------------------
// Theme Initialization Logic (Ensure this calls the function)
// ----------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        // ... other theme initializations ...

        // 1. Call the new Typed.js function on initial load
        initTypedAnimation();
    });




  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();



// // Select all dropdown toggles
// const dropdownToggles = document.querySelectorAll('.dropdown > a');

// // Add event listener to each dropdown toggle
// dropdownToggles.forEach((toggle) => {
//   toggle.addEventListener('click', function (e) {
//     e.preventDefault(); // Prevent default link behavior

//     // Toggle the active class on the parent dropdown
//     const parent = toggle.parentElement;
//     parent.classList.toggle('dropdown-active');

//     // Remove active class from other dropdowns
//     dropdownToggles.forEach((otherToggle) => {
//       const otherParent = otherToggle.parentElement;
//       if (otherParent !== parent) {
//         otherParent.classList.remove('dropdown-active');
//       }
//     });
//   });
// });

// window.addEventListener('scroll', () => {
//   // Ensure no dropdown-related state is being modified on scroll.
// });


// document.querySelectorAll('.dropdown > a').forEach((dropdownLink) => {
//   dropdownLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     const parent = e.target.closest('.dropdown');
    
//     // Close other dropdowns
//     document.querySelectorAll('.dropdown').forEach((el) => {
//       if (el !== parent) {
//         el.classList.remove('dropdown-active');
//         const toggleIcon = el.querySelector('.toggle-dropdown');
//         if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
//       }
//     });

//     // Toggle the clicked dropdown
//     if (parent.classList.contains('dropdown-active')) {
//       parent.classList.remove('dropdown-active');
//       e.target.querySelector('.toggle-dropdown').style.transform = 'rotate(0deg)';
//     } else {
//       parent.classList.add('dropdown-active');
//       e.target.querySelector('.toggle-dropdown').style.transform = 'rotate(180deg)';
//     }
//   });
// });


// document.querySelectorAll('.dropdown > a').forEach((dropdownLink) => {
//   dropdownLink.addEventListener('click', (e) => {
//     const body = document.body;
//     const dropdownActive = e.target.closest('.dropdown').classList.contains('dropdown-active');
    
//     if (!dropdownActive) {
//       body.style.overflow = 'hidden'; // Lock scrolling
//     } else {
//       body.style.overflow = ''; // Unlock scrolling
//     }
//   });
// });



// // Here
// // Handle dropdown toggle logic explicitly on click
// document.querySelectorAll('.dropdown > a').forEach((dropdownLink) => {
//   dropdownLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     const parent = e.target.closest('.dropdown');
    
//     // Close other dropdowns
//     document.querySelectorAll('.dropdown').forEach((el) => {
//       if (el !== parent) {
//         el.classList.remove('dropdown-active');
//         const toggleIcon = el.querySelector('.toggle-dropdown');
//         if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
//       }
//     });

//     // Toggle the clicked dropdown
//     if (parent.classList.contains('dropdown-active')) {
//       parent.classList.remove('dropdown-active');
//       e.target.querySelector('.toggle-dropdown').style.transform = 'rotate(0deg)';
//     } else {
//       parent.classList.add('dropdown-active');
//       e.target.querySelector('.toggle-dropdown').style.transform = 'rotate(180deg)';
//     }
//   });
// });


// window.addEventListener('scroll', () => {
//   let sections = document.querySelectorAll('section');
//   let navLinks = document.querySelectorAll('.navmenu a');

//   sections.forEach((section) => {
//     let top = window.scrollY;
//     let offset = section.offsetTop - 150;
//     let height = section.offsetHeight;
//     let id = section.getAttribute('id');

//     if (top >= offset && top < offset + height) {
//       navLinks.forEach((link) => {
//         link.classList.remove('active');
//       });

//       document
//         .querySelector(`.navmenu a[href*=${id}]`)
//         .classList.add('active');
//     }
//   });
// });

// window.addEventListener('scroll', () => {
//   let sections = document.querySelectorAll('section');
//   let navLinks = document.querySelectorAll('.navmenu a');

//   sections.forEach((section) => {
//     let top = window.scrollY;
//     let offset = section.offsetTop - 150;
//     let height = section.offsetHeight;
//     let id = section.getAttribute('id');

//     if (top >= offset && top < offset + height) {
//       navLinks.forEach((link) => {
//         link.classList.remove('active');
//       });

//       const activeLink = document.querySelector(
//         `.navmenu a[href*=${id}]`
//       );
//       if (activeLink) activeLink.classList.add('active');
//     }
//   });
// });


// document.querySelector('.navmenu').addEventListener('click', (e) => {
//   const isDropdown = e.target.closest('.dropdown > a');
//   if (isDropdown) {
//     e.preventDefault();
//     const parent = isDropdown.closest('.dropdown');
    
//     // Close all dropdowns
//     document.querySelectorAll('.dropdown').forEach((el) => {
//       if (el !== parent) {
//         el.classList.remove('dropdown-active');
//         const toggleIcon = el.querySelector('.toggle-dropdown');
//         if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
//       }
//     });

//     // Toggle the current dropdown
//     if (parent.classList.contains('dropdown-active')) {
//       parent.classList.remove('dropdown-active');
//       isDropdown.querySelector('.toggle-dropdown').style.transform =
//         'rotate(0deg)';
//     } else {
//       parent.classList.add('dropdown-active');
//       isDropdown.querySelector('.toggle-dropdown').style.transform =
//         'rotate(180deg)';
//     }
//   }
// });



/**
 * Global function to initialize Typed.js animation.
 * This MUST be defined outside any local scopes/wrappers.
 */
function initTypedAnimation() {
    const selectTyped = document.querySelector('.typed');

    // Only proceed if the element exists AND has data-typed-items defined
    if (selectTyped && selectTyped.getAttribute('data-typed-items')) {
        let typed_strings = selectTyped.getAttribute('data-typed-items');
        typed_strings = typed_strings.split(',');

        // Check if the instance already exists and destroy it before creating a new one
        if (selectTyped.typed) {
            selectTyped.typed.destroy();
        }

        // Initialize new Typed instance
        selectTyped.typed = new Typed('.typed', {
            strings: typed_strings,
            loop: true,
            typeSpeed: 100,
            backSpeed: 50,
            backDelay: 2000
        });
    }
}








