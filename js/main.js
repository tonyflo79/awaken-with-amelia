/* ============================================
   AWAKEN WITH AMELIA — Main JavaScript
   ============================================ */

(function() {
  'use strict';

  // ---------- LANGUAGE SYSTEM ----------
  const Lang = {
    current: localStorage.getItem('awa-lang') || 'en',

    init() {
      this.apply(this.current);
      document.querySelectorAll('.lang-toggle__btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.apply(btn.dataset.lang);
        });
      });
    },

    apply(lang) {
      this.current = lang;
      localStorage.setItem('awa-lang', lang);

      // Swap text content
      document.querySelectorAll('[data-en]').forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text !== null) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
          } else {
            el.innerHTML = text;
          }
        }
      });

      // Update active button state
      document.querySelectorAll('.lang-toggle__btn').forEach(btn => {
        btn.classList.toggle('lang-toggle__btn--active', btn.dataset.lang === lang);
      });

      // Update html lang attribute
      document.documentElement.lang = lang;

      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const enDesc = metaDesc.getAttribute('data-en');
        const ruDesc = metaDesc.getAttribute('data-ru');
        if (enDesc && ruDesc) {
          metaDesc.content = lang === 'en' ? enDesc : ruDesc;
        }
      }

      // Re-init typewriter if exists
      if (window.awaTypewriter) {
        window.awaTypewriter.destroy();
        initTypewriter();
      }
    }
  };

  // ---------- HEADER SCROLL BEHAVIOR ----------
  const Header = {
    el: null,

    init() {
      this.el = document.querySelector('.header');
      if (!this.el) return;

      // Renew behavior: Squarespace injects padding-top on hero = header height
      // (Source: HTML.md line 1611: style="padding-top: 53px")
      const hero = document.querySelector('.hero--home');
      if (hero) {
        hero.style.paddingTop = this.el.offsetHeight + 'px';
      }

      window.addEventListener('resize', () => {
        const h = document.querySelector('.hero--home');
        if (h) h.style.paddingTop = this.el.offsetHeight + 'px';
      });

      this.update();
      window.addEventListener('scroll', () => this.update(), { passive: true });
    },

    update() {
      const scrolled = window.scrollY > 60;
      this.el.classList.toggle('header--transparent', !scrolled);
      this.el.classList.toggle('header--solid', scrolled);
    }
  };

  // ---------- MOBILE MENU ----------
  const MobileMenu = {
    init() {
      const hamburger = document.querySelector('.hamburger');
      const menu = document.querySelector('.mobile-menu');
      if (!hamburger || !menu) return;

      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('hamburger--open');
        menu.classList.toggle('mobile-menu--open');
        document.body.style.overflow = menu.classList.contains('mobile-menu--open') ? 'hidden' : '';
      });

      // Close on link click
      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('hamburger--open');
          menu.classList.remove('mobile-menu--open');
          document.body.style.overflow = '';
        });
      });
    }
  };

  // ---------- SERVICES DROPDOWN ----------
  const Dropdown = {
    init() {
      const dropdowns = document.querySelectorAll('.dropdown');
      dropdowns.forEach(dd => {
        const trigger = dd.querySelector('.header__link');
        if (!trigger) return;

        // Desktop hover handled via CSS, but add click for mobile
        trigger.addEventListener('click', (e) => {
          if (window.innerWidth <= 1024) {
            e.preventDefault();
            dd.classList.toggle('dropdown--open');
          }
        });
      });

      // Close dropdowns on outside click
      document.addEventListener('click', (e) => {
        dropdowns.forEach(dd => {
          if (!dd.contains(e.target)) {
            dd.classList.remove('dropdown--open');
          }
        });
      });
    }
  };

  // ---------- SCROLL ANIMATIONS ----------
  const ScrollAnim = {
    init() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              entry.target.classList.contains('fade-in') ? 'fade-in--visible' :
              entry.target.classList.contains('fade-in-left') ? 'fade-in-left--visible' :
              entry.target.classList.contains('fade-in-right') ? 'fade-in-right--visible' :
              entry.target.classList.contains('stagger-children') ? 'stagger-children--visible' :
              'fade-in--visible'
            );
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .stagger-children').forEach(el => {
        observer.observe(el);
      });
    }
  };

  // ---------- TYPEWRITER ----------
  function initTypewriter() {
    const el = document.querySelector('.typewriter-text');
    if (!el || typeof TypeIt === 'undefined') return;

    const strings = Lang.current === 'en'
      ? [
          'from surviving... to creating',
          'from anxiety... to inner knowing',
          'from lost... to guided',
          'from broken... to whole',
          'from forgetting... to remembering'
        ]
      : [
          'от выживания... к созиданию',
          'от тревоги... к внутреннему знанию',
          'от потерянности... к ясности',
          'от разрушения... к целостности',
          'от забвения... к вспоминанию'
        ];

    el.innerHTML = '';

    window.awaTypewriter = new TypeIt(el, {
      speed: 55,
      deleteSpeed: 30,
      breakLines: false,
      loop: true,
      loopDelay: 1500,
      waitUntilVisible: true
    });

    strings.forEach((str, i) => {
      window.awaTypewriter
        .type(str)
        .pause(2200)
        .delete(str.length);
      if (i < strings.length - 1) {
        window.awaTypewriter.pause(400);
      }
    });

    window.awaTypewriter.go();
  }

  // ---------- CAROUSEL ----------
  const Carousel = {
    init() {
      document.querySelectorAll('.stories__carousel').forEach(carousel => {
        const cards = carousel.querySelectorAll('.story-card');
        const dotsContainer = carousel.parentElement.querySelector('.stories__nav');
        if (!dotsContainer || cards.length === 0) return;

        // Create dots
        const dotsPerView = window.innerWidth <= 768 ? 1 : 3;
        const pageCount = Math.ceil(cards.length / dotsPerView);

        dotsContainer.innerHTML = '';
        for (let i = 0; i < Math.min(pageCount, cards.length); i++) {
          const dot = document.createElement('button');
          dot.className = 'stories__dot' + (i === 0 ? ' stories__dot--active' : '');
          dot.setAttribute('aria-label', `Slide ${i + 1}`);
          dot.addEventListener('click', () => {
            cards[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
          });
          dotsContainer.appendChild(dot);
        }

        // Update dots on scroll
        carousel.addEventListener('scroll', () => {
          const scrollLeft = carousel.scrollLeft;
          const cardWidth = cards[0].offsetWidth + 32; // gap
          const activeIndex = Math.round(scrollLeft / cardWidth);
          dotsContainer.querySelectorAll('.stories__dot').forEach((dot, i) => {
            dot.classList.toggle('stories__dot--active', i === activeIndex);
          });
        }, { passive: true });
      });
    }
  };

  // ---------- SMOOTH SCROLL ----------
  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const target = document.querySelector(anchor.getAttribute('href'));
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }
  };

  // ---------- ACCORDION ----------
  const Accordion = {
    init() {
      document.querySelectorAll('.accordion__trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
          const item = trigger.closest('.accordion__item');
          const content = item.querySelector('.accordion__content');
          const isOpen = item.classList.contains('accordion__item--open');

          // Close all in same accordion
          const accordion = item.closest('.accordion');
          accordion.querySelectorAll('.accordion__item--open').forEach(openItem => {
            openItem.classList.remove('accordion__item--open');
            openItem.querySelector('.accordion__content').style.maxHeight = '0';
          });

          // Toggle current
          if (!isOpen) {
            item.classList.add('accordion__item--open');
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        });
      });
    }
  };

  // ---------- INIT ----------
  document.addEventListener('DOMContentLoaded', () => {
    Lang.init();
    Header.init();
    MobileMenu.init();
    Dropdown.init();
    ScrollAnim.init();
    Carousel.init();
    SmoothScroll.init();
    Accordion.init();
    initTypewriter();
  });

})();
