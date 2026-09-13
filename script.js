(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    document.addEventListener('DOMContentLoaded', function () {
        initPreloader();
        initHeader();
        initMobileNav();
        initActiveNavOnScroll();
        initBackToTop();
        initScrollProgress();
        initReveal();
        initHeroIntro();
        initStatCounters();

        if (hasFinePointer && !prefersReducedMotion) {
            initCustomCursor();
            initMagneticButtons();
            initTiltCards();
        }
    });

    /* ---------- Preloader ---------- */
    function initPreloader() {
        var preloader = document.querySelector('.preloader');
        if (!preloader) return;
        window.addEventListener('load', function () {
            setTimeout(function () {
                preloader.classList.add('fade-out');
                setTimeout(function () {
                    preloader.style.display = 'none';
                }, 550);
            }, 250);
        });
    }

    /* ---------- Header: sombra ao rolar ---------- */
    function initHeader() {
        var header = document.querySelector('.header');
        if (!header) return;
        var onScroll = function () {
            if (window.scrollY > 24) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------- Menu mobile ---------- */
    function initMobileNav() {
        var toggle = document.getElementById('nav-toggle');
        var close = document.getElementById('nav-close');
        var menu = document.getElementById('nav-menu');
        if (!toggle || !menu) return;

        var open = function () { menu.classList.add('active'); };
        var shut = function () { menu.classList.remove('active'); };

        toggle.addEventListener('click', open);
        if (close) close.addEventListener('click', shut);

        menu.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', shut);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') shut();
        });
    }

    /* ---------- Destaca o link ativo conforme a seção visível ---------- */
    function initActiveNavOnScroll() {
        var sections = document.querySelectorAll('section[id]');
        var links = document.querySelectorAll('.nav-link');
        if (!sections.length || !links.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.getAttribute('id');
                links.forEach(function (link) {
                    var match = link.getAttribute('href') === '#' + id;
                    link.classList.toggle('active', match);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sections.forEach(function (section) { observer.observe(section); });
    }

    /* ---------- Botão voltar ao topo ---------- */
    function initBackToTop() {
        var btn = document.getElementById('back-to-top');
        if (!btn) return;
        window.addEventListener('scroll', function () {
            btn.classList.toggle('active', window.scrollY > 480);
        }, { passive: true });
    }

    /* ---------- Barra de progresso de scroll ---------- */
    function initScrollProgress() {
        var bar = document.getElementById('scroll-progress');
        if (!bar) return;
        var ticking = false;

        var update = function () {
            var doc = document.documentElement;
            var scrolled = doc.scrollTop;
            var max = doc.scrollHeight - doc.clientHeight;
            var ratio = max > 0 ? scrolled / max : 0;
            bar.style.transform = 'scaleX(' + ratio + ')';
            ticking = false;
        };

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });

        update();
    }

    /* ---------- Reveal ao entrar na viewport ---------- */
    function initReveal() {
        var items = document.querySelectorAll('.reveal, .reveal-image, .reveal-scale');
        if (!items.length) return;

        if (!('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        items.forEach(function (el) { observer.observe(el); });
    }

    /* ---------- Entrada orquestrada do hero + spotlight no cursor ---------- */
    function initHeroIntro() {
        var hero = document.querySelector('.home');
        if (!hero) return;

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                hero.classList.add('loaded');
            });
        });

        if (prefersReducedMotion || !hasFinePointer) return;

        hero.addEventListener('mouseenter', function () {
            hero.classList.add('spotlight-active');
        });
        hero.addEventListener('mouseleave', function () {
            hero.classList.remove('spotlight-active');
        });
        hero.addEventListener('mousemove', function (e) {
            var rect = hero.getBoundingClientRect();
            var x = ((e.clientX - rect.left) / rect.width) * 100;
            var y = ((e.clientY - rect.top) / rect.height) * 100;
            hero.style.setProperty('--mx', x + '%');
            hero.style.setProperty('--my', y + '%');
        });
    }

    /* ---------- Contadores animados nas estatísticas do hero ---------- */
    function initStatCounters() {
        var stats = document.querySelectorAll('.stat-number');
        if (!stats.length || !('IntersectionObserver' in window)) return;

        var animate = function (el) {
            var text = el.textContent.trim();
            var match = text.match(/^(\d+)(.*)$/);
            if (!match) return;

            var target = parseInt(match[1], 10);
            var suffix = match[2];
            var duration = 900;
            var start = null;

            if (prefersReducedMotion) {
                el.textContent = text;
                return;
            }

            var step = function (timestamp) {
                if (!start) start = timestamp;
                var progress = Math.min((timestamp - start) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                var value = Math.round(eased * target);
                el.textContent = value + suffix;
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = text;
                }
            };
            requestAnimationFrame(step);
        };

        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animate(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        stats.forEach(function (el) { observer.observe(el); });
    }

    /* ---------- Cursor customizado ---------- */
    function initCustomCursor() {
        var dot = document.getElementById('cursor-dot');
        var ring = document.getElementById('cursor-ring');
        if (!dot || !ring) return;

        document.documentElement.classList.add('has-custom-cursor');

        var mouseX = 0, mouseY = 0;
        var ringX = 0, ringY = 0;

        window.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
        });

        var loop = function () {
            ringX += (mouseX - ringX) * 0.16;
            ringY += (mouseY - ringY) * 0.16;
            ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);

        var hoverTargets = 'a, button, .btn, .project-card, .nav-link, .tech-item, .contact-card';
        document.addEventListener('mouseover', function (e) {
            if (e.target.closest(hoverTargets)) ring.classList.add('is-active');
        });
        document.addEventListener('mouseout', function (e) {
            if (e.target.closest(hoverTargets)) ring.classList.remove('is-active');
        });

        document.addEventListener('mouseleave', function () {
            dot.style.opacity = '0';
            ring.style.opacity = '0';
        });
        document.addEventListener('mouseenter', function () {
            dot.style.opacity = '';
            ring.style.opacity = '';
        });
    }

    /* ---------- Botões magnéticos ---------- */
    function initMagneticButtons() {
        var buttons = document.querySelectorAll('.magnetic');
        buttons.forEach(function (btn) {
            var strength = 0.35;

            btn.addEventListener('mousemove', function (e) {
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                btn.style.transition = 'transform 0.12s ease-out';
                btn.style.transform = 'translate(' + x * strength + 'px,' + y * strength + 'px)';
            });

            btn.addEventListener('mouseleave', function () {
                btn.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    /* ---------- Tilt 3D nos cards de projeto ---------- */
    function initTiltCards() {
        var cards = document.querySelectorAll('.project-card');
        cards.forEach(function (card) {
            var maxTilt = 6;

            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var px = (e.clientX - rect.left) / rect.width;
                var py = (e.clientY - rect.top) / rect.height;
                var rotateY = (px - 0.5) * (maxTilt * 2);
                var rotateX = (0.5 - py) * (maxTilt * 2);
                card.classList.remove('no-tilt');
                card.style.transform =
                    'perspective(1200px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
            });

            card.addEventListener('mouseleave', function () {
                card.classList.add('no-tilt');
                card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0)';
            });
        });
    }
})();
