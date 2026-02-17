// script.js - Atualizado com funcionalidades do carrossel

// ===== ANIMAÇÕES DE SCROLL (CÓDIGO ORIGINAL) =====
const myObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    });
});

const elements = document.querySelectorAll('.hidden, .hidden-blurless');
elements.forEach((element) => myObserver.observe(element));

// ===== FUNÇÕES AUXILIARES =====

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function getTipoCasoTexto(value) {
    const tipos = {
        'defesa-crm': 'Defesa Ética - CRM/CRO',
        'planos-saude': 'Ações contra Planos de Saúde',
        'responsabilidade': 'Responsabilidade Profissional',
        'contratos': 'Contratos Médicos',
        'outro': 'Outro'
    };
    return tipos[value] || value;
}

function showMessage(message, type = 'info') {
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) existingMessage.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.innerHTML = `
        <p>${message}</p>
        <button class="close-message">&times;</button>
    `;

    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;

    messageDiv.querySelector('.close-message').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        margin-left: 15px;
        padding: 0;
        line-height: 1;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => messageDiv.remove(), 8000);

    messageDiv.querySelector('.close-message').addEventListener('click', () => messageDiv.remove());

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

function isMobile() {
    return window.innerWidth <= 768;
}

// ===== FUNCIONALIDADE DO CARROSSEL =====
function initCarousel() {
    const carousel = document.querySelector('.specialties-carousel');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    const cards = document.querySelectorAll('.specialty-card');
    
    if (!carousel || cards.length === 0) return;
    
    let currentIndex = 0;
    let totalCards = cards.length;
    let cardsPerView = 3;
    let autoSlideInterval;
    
    // Calcular cards por view baseado no tamanho da tela
    function updateCardsPerView() {
        if (window.innerWidth <= 768) {
            cardsPerView = 1;
        } else if (window.innerWidth <= 1024) {
            cardsPerView = 2;
        } else {
            cardsPerView = 3;
        }
    }
    
    // Criar dots de navegação
    function createDots() {
        if (!dotsContainer) return;
        
        dotsContainer.innerHTML = '';
        const totalDots = Math.ceil(totalCards / cardsPerView);
        
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('div');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.setAttribute('data-index', i);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    // Atualizar posição do carrossel
    function updateCarousel() {
        updateCardsPerView();
        const cardWidth = cards[0].offsetWidth + 30; // width + gap
        const translateX = -(currentIndex * cardWidth * cardsPerView);
        carousel.style.transform = `translateX(${translateX}px)`;
        
        // Atualizar dots ativos
        updateDots();
        
        // Atualizar visibilidade dos botões
        updateButtons();
    }
    
    // Atualizar estado dos botões
    function updateButtons() {
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
            prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
            prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';
        }
        
        if (nextBtn) {
            const maxIndex = Math.ceil(totalCards / cardsPerView) - 1;
            nextBtn.disabled = currentIndex >= maxIndex;
            nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
            nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
        }
    }
    
    // Atualizar dots ativos
    function updateDots() {
        const dots = document.querySelectorAll('.dot');
        const activeDotIndex = Math.floor(currentIndex);
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeDotIndex);
        });
    }
    
    // Navegar para slide específico
    function goToSlide(index) {
        const maxIndex = Math.ceil(totalCards / cardsPerView) - 1;
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        updateCarousel();
    }
    
    // Navegar para próximo
    function nextSlide() {
        const maxIndex = Math.ceil(totalCards / cardsPerView) - 1;
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    }
    
    // Navegar para anterior
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }
    
    // Iniciar slideshow automático
    function startAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            const maxIndex = Math.ceil(totalCards / cardsPerView) - 1;
            if (currentIndex < maxIndex) {
                nextSlide();
            } else {
                goToSlide(0);
            }
        }, 5000);
    }
    
    // Parar slideshow automático
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    // Inicializar carrossel
    function init() {
        updateCardsPerView();
        createDots();
        updateCarousel();
        startAutoSlide();
        
        // Event listeners para botões
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide();
                prevSlide();
                setTimeout(startAutoSlide, 5000);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopAutoSlide();
                nextSlide();
                setTimeout(startAutoSlide, 5000);
            });
        }
        
        // Event listeners para touch/swipe
        let startX = 0;
        let endX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            stopAutoSlide();
        });
        
        carousel.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
        });
        
        carousel.addEventListener('touchend', () => {
            const threshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
            
            setTimeout(startAutoSlide, 5000);
        });
        
        // Event listener para redimensionamento
        window.addEventListener('resize', debounce(() => {
            updateCardsPerView();
            createDots();
            updateCarousel();
        }, 250));
        
        // Pausar auto-slide no hover
        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoSlide);
            carouselContainer.addEventListener('mouseleave', startAutoSlide);
        }
    }
    
    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

// ===== INICIALIZAÇÃO PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function () {
    // ===== 1. INICIALIZAR CARROSSEL =====
    initCarousel();
    
    // ===== 2. MENU MOBILE (ATUALIZADO PARA BLOG) =====
    const menuToggle = document.querySelector('.menu-toggle, .menu-toggle-blog');
    const navMenu = document.querySelector('.nav-menu, .nav-menu-blog');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded',
                navMenu.classList.contains('active').toString()
            );

            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        const menuLinks = document.querySelectorAll('.nav-menu a, .nav-menu-blog a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // ===== 3. FORMULÁRIO DE CONTATO (ATUALIZADO) =====
    const contactForm = document.getElementById('consultaForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nome = document.getElementById('nome').value.trim();
            const whatsapp = document.getElementById('whatsapp').value.trim();
            const email = document.getElementById('email').value.trim();
            const tipoCaso = document.getElementById('tipo-caso').value;
            const mensagem = document.getElementById('mensagem').value.trim();

            if (!nome || !whatsapp || !email || !tipoCaso || !mensagem) {
                showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }

            const whatsappNumerico = whatsapp.replace(/\D/g, '');
            if (whatsappNumerico.length < 10) {
                showMessage('Por favor, insira um número de WhatsApp válido com DDD.', 'error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Por favor, insira um email válido.', 'error');
                return;
            }

            const mensagemWhatsApp = `*NOVA CONSULTA - SITE ERIC MACÊDO*%0A%0A` +
                `Nome: ${nome}%0A` +
                `WhatsApp: ${whatsapp}%0A` +
                `Email: ${email}%0A` +
                `Tipo de Caso: ${getTipoCasoTexto(tipoCaso)}%0A` +
                `Mensagem: ${mensagem.substring(0, 1500)}%0A%0A` +
                `   Enviado via site - ${new Date().toLocaleDateString('pt-BR')}`;

            const whatsappURL = `https://wa.me/5575991804444?text=${mensagemWhatsApp}`;
            window.open(whatsappURL, '_blank');

            setTimeout(() => {
                contactForm.reset();
                contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 2000);
        });
    }

    // ===== 4. VALIDAÇÃO DE WHATSAPP EM TEMPO REAL =====
    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length > 2) {
                value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
            }
            if (value.length > 10) {
                value = value.substring(0, 10) + '-' + value.substring(10, 15);
            }

            e.target.value = value;
        });
    }

    // ===== 5. CONTADOR ANIMADO DAS ESTATÍSTICAS =====
    const counterElement = document.querySelector('.counter-number[data-target]');
    if (counterElement) {
        const targetValue = parseInt(counterElement.getAttribute('data-target'));
        const duration = 2000;
        const increment = targetValue / (duration / 16);

        let currentValue = 0;

        const updateCounter = () => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                counterElement.textContent = targetValue;
            } else {
                counterElement.textContent = Math.floor(currentValue);
                requestAnimationFrame(updateCounter);
            }
        };

        const counterObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateCounter();
                counterObserver.unobserve(counterElement);
            }
        }, { threshold: 0.5 });

        counterObserver.observe(counterElement);
    }

    // ===== 6. ANIMAÇÃO DAS BARRAS DE DISTRIBUIÇÃO =====
    const barFills = document.querySelectorAll('.bar-fill');
    if (barFills.length > 0) {
        const barObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.style.width;

                    bar.style.width = '0%';

                    setTimeout(() => {
                        bar.style.width = width;
                        bar.style.transition = 'width 1.5s ease-out';
                    }, 200);

                    barObserver.unobserve(bar);
                }
            });
        }, { threshold: 0.3 });

        barFills.forEach(bar => barObserver.observe(bar));
    }

    // ===== 7. BOTÃO WHATSAPP FLUTUANTE =====
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
        setTimeout(() => {
            whatsappFloat.classList.remove('hidden');
            whatsappFloat.classList.add('show');
        }, 1000);

        setInterval(() => {
            whatsappFloat.style.animation = 'pulse 2s ease-in-out';
            setTimeout(() => {
                whatsappFloat.style.animation = '';
            }, 2000);
        }, 10000);
    }

    // ===== 8. LAZY LOADING PARA IMAGENS =====
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');

                    if (img.complete) {
                        img.classList.add('loaded');
                    } else {
                        img.addEventListener('load', () => {
                            img.classList.add('loaded');
                        });

                        img.addEventListener('error', () => {
                            console.warn('Erro ao carregar imagem:', img.src);
                        });
                    }

                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px',
            threshold: 0.1
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ===== 9. SCROLL SUAVE PARA LINKS INTERNOS (ATUALIZADO PARA BLOG) =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href === '#' || href === '#home') return;

            if (href.startsWith('#') && href.length > 1) {
                if (window.location.pathname.includes('blog.html')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(href);
                    
                    if (targetElement) {
                        const headerHeight = document.querySelector('.main-nav, .main-nav-blog').offsetHeight || 100;
                        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                    return;
                }
            }

            e.preventDefault();
            const targetElement = document.querySelector(href);

            if (targetElement) {
                const headerHeight = document.querySelector('.main-nav, .main-nav-blog').offsetHeight || 100;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== 10. PRELOAD DE IMAGENS CRÍTICAS =====
    const criticalImages = [
        'Media/Logo sem fundo.png',
        'Media/Foto do Advogado.png',
        'Media/background hero.jpg'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // ===== 11. DETECÇÃO DE TOUCH DEVICE =====
    let isTouchDevice = false;

    try {
        document.createEvent('TouchEvent');
        isTouchDevice = true;
    } catch (e) {
        isTouchDevice = false;
    }

    if (isTouchDevice) {
        document.body.classList.add('touch-device');

        document.querySelectorAll('.specialty-card, .article-card, .testimonial-card').forEach(card => {
            card.addEventListener('touchstart', function () {
                this.classList.add('touch-active');
            }, { passive: true });

            card.addEventListener('touchend', function () {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            }, { passive: true });
        });
    }

    // ===== 13. ANIMAÇÃO DO TIMELINE PROGRESS =====
    const timelineProgress = document.querySelector('.timeline-progress');
    if (timelineProgress) {
        const timelineObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                timelineProgress.style.width = '100%';
                timelineObserver.unobserve(timelineProgress);
            }
        }, { threshold: 0.5 });

        timelineObserver.observe(timelineProgress);
    }

    // ===== 14. HOVER EFFECTS PARA CARDS =====
    document.querySelectorAll('.result-card, .specialty-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.zIndex = '10';
        });

        card.addEventListener('mouseleave', function () {
            this.style.zIndex = '1';
        });
    });

    // ===== 15. ANIMAÇÃO DOS BADGES DE CREDIBILIDADE =====
    const statBadges = document.querySelectorAll('.stat-badge');
    if (statBadges.length > 0) {
        const badgeObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 200);
                    badgeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statBadges.forEach((badge, index) => {
            badge.style.opacity = '0';
            badge.style.transform = 'translateY(20px)';
            badge.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            badgeObserver.observe(badge);
        });
    }

    // ===== 16. DETECÇÃO DE CONEXÃO LENTA =====
    if ('connection' in navigator) {
        const connection = navigator.connection;

        if (connection.saveData || connection.effectiveType.includes('2g') || connection.effectiveType.includes('3g')) {
            document.querySelectorAll('img').forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
            });

            document.body.classList.add('slow-connection');
        }
    }

    // ===== 17. ANIMAÇÃO DO FORMULÁRIO QUANDO VISÍVEL =====
    const contactFormSection = document.querySelector('.contact-form-section');
    if (contactFormSection) {
        const formObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const formElements = contactFormSection.querySelectorAll('.form-group');
                formElements.forEach((element, index) => {
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, index * 100);
                });
                formObserver.unobserve(contactFormSection);
            }
        }, { threshold: 0.2 });

        const formElements = contactFormSection.querySelectorAll('.form-group');
        formElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });

        formObserver.observe(contactFormSection);
    }

    // ===== 18. REDIRECIONAMENTO DO BLOG PARA CONTATO =====
    document.querySelectorAll('.read-more[href="#contato"], .cta-buttons a[href*="#contato"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const formSection = document.querySelector('#contato');
            if (formSection) {
                const headerHeight = document.querySelector('.main-nav, .main-nav-blog').offsetHeight || 100;
                const targetPosition = formSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                setTimeout(() => {
                    const mensagemField = document.getElementById('mensagem');
                    if (mensagemField) {
                        const articleTitle = this.closest('.article-content')?.querySelector('h3')?.textContent ||
                                            this.closest('.specialty-content')?.querySelector('h3')?.textContent ||
                                            'Consulta Especializada';
                        mensagemField.placeholder = `Gostaria de consultoria sobre: ${articleTitle}`;
                        mensagemField.focus();
                    }
                }, 800);
            }
        });
    });

    // ===== 19. ANIMAÇÃO DO MARCOS DO TIMELINE =====
    const timelineMarkers = document.querySelectorAll('.timeline-marker');
    if (timelineMarkers.length > 0) {
        const markerObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                timelineMarkers.forEach((marker, index) => {
                    setTimeout(() => {
                        marker.style.transform = 'translate(-50%, -50%) scale(1.2)';
                        marker.style.backgroundColor = 'var(--accent-color)';

                        setTimeout(() => {
                            marker.style.transform = 'translate(-50%, -50%) scale(1)';
                        }, 300);
                    }, index * 300);
                });
                markerObserver.unobserve(entries[0].target);
            }
        }, { threshold: 0.5 });

        markerObserver.observe(document.querySelector('.timeline-visual'));
    }

    // ===== 20. ENVIAR EMAIL PELO FOOTER =====
    const emailContact = document.querySelector('.footer-contacts a[href^="mailto:"]');
    if (emailContact) {
        emailContact.addEventListener('click', function (e) {
            e.preventDefault();
            const email = 'eric_luiz7@hotmail.com';
            const subject = 'Consulta - Site Eric Macêdo Advogado';
            const body = 'Olá Dr. Eric Macêdo,\n\nGostaria de agendar uma consulta sobre:\n\n';

            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });
    }

    // ===== 21. ANIMAÇÃO DO LOGO NO HOVER =====
    const logo = document.querySelector('.logo img');
    if (logo) {
        logo.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.05) rotate(-2deg)';
        });

        logo.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    }

    // ===== 22. VALIDAÇÃO DE FORMULÁRIO ADICIONAL =====
    const formFields = document.querySelectorAll('#consultaForm input, #consultaForm textarea, #consultaForm select');
    formFields.forEach(field => {
        field.addEventListener('blur', function () {
            if (this.value.trim() === '' && this.hasAttribute('required')) {
                this.style.borderColor = '#ff6b6b';
            } else {
                this.style.borderColor = '';
            }
        });

        field.addEventListener('input', function () {
            if (this.value.trim() !== '') {
                this.style.borderColor = '#618056';
            }
        });
    });

    // ===== 23. ANIMAÇÃO DO BOTÃO SUBMIT =====
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';

            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    }

    // ===== 24. ATUALIZAR ANO NO FOOTER =====
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('[data-current-year]');
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });

    // ===== 25. ANIMAÇÃO DE ENTRADA PARA O HERO =====
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        setTimeout(() => {
            heroContent.classList.add('hero-visible');
        }, 300);
    }
});

// ===== 26. OBSERVADOR PARA ELEMENTOS COM ANIMAÇÃO PERSONALIZADA =====
const customObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('metric-item')) {
                setTimeout(() => {
                    entry.target.classList.add('pop-in');
                }, entry.target.dataset.delay || 0);
            }

            if (entry.target.classList.contains('tag')) {
                entry.target.classList.add('tag-visible');
            }

            customObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
});

// Observar elementos que precisam de animação personalizada
document.querySelectorAll('.metric-item, .tag').forEach(el => {
    customObserver.observe(el);
});

// ===== 27. OTIMIZAÇÃO DE PERFORMANCE PARA ANIMAÇÕES =====
let ticking = false;
window.addEventListener('scroll', function () {
    if (!ticking) {
        window.requestAnimationFrame(function () {
            const mainNav = document.querySelector('.main-nav, .main-nav-blog');
            if (mainNav && window.scrollY > 100) {
                mainNav.style.background = 'var(--gradient-primary)';
                mainNav.style.boxShadow = 'var(--shadow-md)';
            } else if (mainNav) {
                mainNav.style.background = 'linear-gradient(to left, var(--gradient-secondary), var(--gradient-primary))';
                mainNav.style.boxShadow = 'none';
            }

            ticking = false;
        });

        ticking = true;
    }
});

// ===== EVENT LISTENERS GLOBAIS =====

window.addEventListener('load', function () {
    document.body.classList.add('loaded');

    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.display = 'none';
    }
});

window.addEventListener('error', function (e) {
    console.warn('Erro capturado:', e.message);

    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
    }
}, true);

window.addEventListener('resize', debounce(function () {
    if (isMobile()) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
    }
}, 250));

// ===== 28. FUNCIONALIDADE DO ACCORDION DO BLOG (ATUALIZADA) =====
document.addEventListener('DOMContentLoaded', function () {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    if (accordionHeaders.length > 0) {
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const openItem = urlParams.get('open');
        
        if (openItem) {
            const itemIndex = parseInt(openItem);
            if (!isNaN(itemIndex) && itemIndex >= 0 && itemIndex < 6) {
                setTimeout(() => {
                    if (accordionHeaders[itemIndex]) {
                        accordionHeaders[itemIndex].click();
                    }
                }, 500);
            }
        }

        function toggleAccordion(header) {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const arrow = header.querySelector('.accordion-arrow');
            
            const isOpen = item.classList.contains('active');
            
            accordionHeaders.forEach(otherHeader => {
                const otherItem = otherHeader.parentElement;
                const otherContent = otherHeader.nextElementSibling;
                const otherArrow = otherHeader.querySelector('.accordion-arrow');
                
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherHeader.classList.remove('active');
                    otherContent.style.maxHeight = null;
                    if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                }
            });
            
            if (!isOpen) {
                item.classList.add('active');
                header.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + 'px';
                if (arrow) arrow.style.transform = 'rotate(180deg)';
                
                setTimeout(() => {
                    item.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            } else {
                item.classList.remove('active');
                header.classList.remove('active');
                header.setAttribute('aria-expanded', 'false');
                content.style.maxHeight = null;
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            }
        }
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function () {
                toggleAccordion(this);
            });
            
            header.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextHeader = this.parentElement.nextElementSibling?.querySelector('.accordion-header');
                    if (nextHeader) {
                        nextHeader.focus();
                    }
                }
                
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevHeader = this.parentElement.previousElementSibling?.querySelector('.accordion-header');
                    if (prevHeader) {
                        prevHeader.focus();
                    }
                }
            });
        });
        
        window.addEventListener('resize', debounce(function () {
            const openContent = document.querySelector('.accordion-content[style*="max-height"]');
            if (openContent) {
                openContent.style.maxHeight = openContent.scrollHeight + 'px';
            }
        }, 250));
    }
});

// ===== 29. ANIMAÇÃO DOS ITENS DO ACCORDION =====
const accordionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            accordionObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.addEventListener('DOMContentLoaded', function () {
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        setTimeout(() => {
            accordionObserver.observe(item);
        }, index * 50);
    });
});

// ===== 30. MARCAÇÃO DO MENU ATIVO DO BLOG =====
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('blog.html')) {
        const navLinks = document.querySelectorAll('.nav-menu a, .nav-menu-blog a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === 'blog.html' || 
                link.getAttribute('href').includes('blog.html')) {
                link.classList.add('active');
            }
        });
    }
});

// ===== 31. FUNÇÃO PARA ABRIR ACCORDION ESPECÍFICO =====
window.openBlogAccordion = function(index) {
    if (window.location.pathname.includes('blog.html')) {
        const headers = document.querySelectorAll('.accordion-header');
        if (headers[index]) {
            headers[index].click();
        }
    } else {
        window.location.href = 'blog.html#open=' + index;
    }
};

// ===== 32. FILTRAR CATEGORIAS DO BLOG (se houver) =====
document.addEventListener('DOMContentLoaded', function () {
    const categoryTags = document.querySelectorAll('.category-tag');
    
    if (categoryTags.length > 0) {
        categoryTags.forEach(tag => {
            tag.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.getAttribute('data-category') || this.getAttribute('href')?.replace('#', '');
                
                if (category) {
                    const accordionItems = document.querySelectorAll('.accordion-item');
                    
                    accordionItems.forEach(item => {
                        const itemCategory = item.getAttribute('data-category') || item.id;
                        
                        if (category === 'all' || itemCategory === category) {
                            item.style.display = 'block';
                            item.style.animation = 'fadeInUp 0.4s ease';
                        } else {
                            item.style.animation = 'fadeOut 0.3s ease';
                            setTimeout(() => {
                                item.style.display = 'none';
                            }, 300);
                        }
                    });
                    
                    categoryTags.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        });
    }
});

// ===== INICIALIZAÇÃO FINAL =====
if (isMobile()) {
    document.body.classList.add('mobile-view');
}

console.log('✅ Eric Macêdo Advogado - Site inicializado com sucesso!');
