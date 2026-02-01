// script.js - Atualizado com todas as novas funcionalidades

// ===== ANIMAÇÕES DE SCROLL (CÓDIGO ORIGINAL) =====
const myObserver = new IntersectionObserver((entries) => {
    // Intersection é um valor booleano, ou seja quando vc está numa parte da tela é true e quando não está é false
    // com isso essa primeira variável fica vendo em qual parte da tela vc está
    entries.forEach((entry) => {
        // Essa parte pega os elementos observados
        if (entry.isIntersecting) {
            // se ele estiver na sua tela classe show criada no css será ativada
            entry.target.classList.add('show');
        } else {
            // no momento em que você rola e tal elemento sai da área de visão da tela
            // a classe show é removida, e a classe padrão setada lá que é a hidden passa a ser usada
            entry.target.classList.remove('show');
        }
    });
});

const elements = document.querySelectorAll('.hidden, .hidden-blurless');
// isso seleciona todos os elementos escondidos 
elements.forEach((element) => myObserver.observe(element));
// e fica vigiando eles

// ===== FUNÇÕES AUXILIARES =====

// Função para debounce (otimização de performance)
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

// Função para throttle (otimização de performance)
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

// Função para animar contadores (reutilizável)
function animateCounter(element, targetValue, duration = 2000) {
    const startValue = 0;
    const startTime = Date.now();

    function updateCounter() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const currentValue = Math.floor(progress * targetValue);
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue;
        }
    }

    updateCounter();
}

// Função auxiliar para obter texto do tipo de caso
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

// Função para mostrar mensagens
function showMessage(message, type = 'info') {
    // Remove mensagem anterior se existir
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) existingMessage.remove();

    // Cria nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.innerHTML = `
        <p>${message}</p>
        <button class="close-message">&times;</button>
    `;

    // Estilos inline
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

    // Botão fechar
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

    // Fechar mensagem após 8 segundos ou ao clicar
    setTimeout(() => messageDiv.remove(), 8000);

    // Fechar ao clicar
    messageDiv.querySelector('.close-message').addEventListener('click', () => messageDiv.remove());

    // Animação CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// Verificar se é mobile para ajustes
function isMobile() {
    return window.innerWidth <= 768;
}

// ===== INICIALIZAÇÃO PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function () {
    // ===== 1. MENU MOBILE =====
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

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

        // Fechar menu ao clicar em link
        document.querySelectorAll('.nav-menu a').forEach(link => {
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

    // ===== 2. FORMULÁRIO DE CONTATO (ATUALIZADO) =====
    const contactForm = document.getElementById('consultaForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Coletar dados do formulário
            const nome = document.getElementById('nome').value.trim();
            const whatsapp = document.getElementById('whatsapp').value.trim();
            const email = document.getElementById('email').value.trim();
            const tipoCaso = document.getElementById('tipo-caso').value;
            const mensagem = document.getElementById('mensagem').value.trim();

            // Validação básica
            if (!nome || !whatsapp || !email || !tipoCaso || !mensagem) {
                showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }

            // Validar WhatsApp
            const whatsappNumerico = whatsapp.replace(/\D/g, '');
            if (whatsappNumerico.length < 10) {
                showMessage('Por favor, insira um número de WhatsApp válido com DDD.', 'error');
                return;
            }

            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Por favor, insira um email válido.', 'error');
                return;
            }

            // Formatar mensagem para WhatsApp
            const mensagemWhatsApp = `*NOVA CONSULTA - SITE ERIC MACÊDO*%0A%0A` +
                `Nome: ${nome}%0A` +
                `WhatsApp: ${whatsapp}%0A` +
                `Email: ${email}%0A` +
                `Tipo de Caso: ${getTipoCasoTexto(tipoCaso)}%0A` +
                `Mensagem: ${mensagem.substring(0, 1500)}%0A%0A` +
                `   Enviado via site - ${new Date().toLocaleDateString('pt-BR')}`;

            // Abrir WhatsApp em nova aba
            const whatsappURL = `https://wa.me/5575991804444?text=${mensagemWhatsApp}`;
            window.open(whatsappURL, '_blank');

            // Limpar formulário após 2 segundos
            setTimeout(() => {
                contactForm.reset();
                // Rolagem suave para o topo do formulário
                contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 2000);
        });
    }

    // ===== 3. VALIDAÇÃO DE WHATSAPP EM TEMPO REAL =====
    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');

            // Formatar como telefone brasileiro
            if (value.length > 2) {
                value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
            }
            if (value.length > 10) {
                value = value.substring(0, 10) + '-' + value.substring(10, 15);
            }

            e.target.value = value;
        });
    }

    // ===== 4. CONTADOR ANIMADO DAS ESTATÍSTICAS =====
    const counterElement = document.querySelector('.counter-number[data-target]');
    if (counterElement) {
        const targetValue = parseInt(counterElement.getAttribute('data-target'));
        const duration = 2000; // 2 segundos
        const increment = targetValue / (duration / 16); // 60fps

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

        // Iniciar animação quando o elemento estiver visível
        const counterObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateCounter();
                counterObserver.unobserve(counterElement);
            }
        }, { threshold: 0.5 });

        counterObserver.observe(counterElement);
    }

    // ===== 5. ANIMAÇÃO DAS BARRAS DE DISTRIBUIÇÃO =====
    const barFills = document.querySelectorAll('.bar-fill');
    if (barFills.length > 0) {
        const barObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.style.width;

                    // Reset para animação
                    bar.style.width = '0%';

                    // Animar para largura final
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

    // ===== 6. BOTÃO WHATSAPP FLUTUANTE =====
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
        // Mostrar botão após delay
        setTimeout(() => {
            whatsappFloat.classList.remove('hidden');
            whatsappFloat.classList.add('show');
        }, 1000);

        // Adicionar animação de pulso periódica
        setInterval(() => {
            whatsappFloat.style.animation = 'pulse 2s ease-in-out';
            setTimeout(() => {
                whatsappFloat.style.animation = '';
            }, 2000);
        }, 10000);
    }

    // ===== 7. LAZY LOADING PARA IMAGENS =====
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');

                    // Se já carregou
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

    // ===== 8. SCROLL SUAVE PARA LINKS INTERNOS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href === '#' || href === '#home') return;

            e.preventDefault();
            const targetElement = document.querySelector(href);

            if (targetElement) {
                const headerHeight = document.querySelector('.main-nav').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== 9. PRELOAD DE IMAGENS CRÍTICAS =====
    const criticalImages = [
        'Media/Logo sem fundo.png',
        'Media/Foto do Advogado.png',
        'Media/background hero.jpg'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // ===== 10. DETECÇÃO DE TOUCH DEVICE =====
    let isTouchDevice = false;

    try {
        document.createEvent('TouchEvent');
        isTouchDevice = true;
    } catch (e) {
        isTouchDevice = false;
    }

    if (isTouchDevice) {
        document.body.classList.add('touch-device');

        // Ajustar hover para touch
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

    // ===== 11. COOKIE CONSENT SIMPLIFICADO =====
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {

            // Estilos inline para o banner
            cookieBanner.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--gradient-primary);
                color: white;
                padding: 1rem;
                z-index: 9999;
                transform: translateY(100%);
                transition: transform 0.3s ease;
            `;

            cookieBanner.querySelector('.cookie-content').style.cssText = `
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
                flex-wrap: wrap;
            `;

            cookieBanner.querySelector('.cookie-accept').style.cssText = `
                background: white;
                color: var(--primary-color);
                border: none;
                padding: 0.5rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
                transition: transform 0.2s;
            `;

            document.body.appendChild(cookieBanner);

            // Mostrar banner
            setTimeout(() => {
                cookieBanner.style.transform = 'translateY(0)';
            }, 1000);

            // Aceitar cookies
            document.querySelector('.cookie-accept').addEventListener('click', () => {
                localStorage.setItem('cookiesAccepted', 'true');
                cookieBanner.style.transform = 'translateY(100%)';
                setTimeout(() => {
                    cookieBanner.remove();
                }, 300);
            });
        }, 2000);
    }

    // ===== 12. ANIMAÇÃO DO TIMELINE PROGRESS =====
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

    // ===== 13. HOVER EFFECTS PARA CARDS =====
    document.querySelectorAll('.result-card, .specialty-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.zIndex = '10';
        });

        card.addEventListener('mouseleave', function () {
            this.style.zIndex = '1';
        });
    });

    // ===== 14. ANIMAÇÃO DOS BADGES DE CREDIBILIDADE =====
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

    // ===== 15. DETECÇÃO DE CONEXÃO LENTA =====
    if ('connection' in navigator) {
        const connection = navigator.connection;

        if (connection.saveData || connection.effectiveType.includes('2g') || connection.effectiveType.includes('3g')) {
            // Otimizar para conexão lenta
            document.querySelectorAll('img').forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
            });

            // Desativar algumas animações
            document.body.classList.add('slow-connection');
        }
    }

    // ===== 16. ANIMAÇÃO DO FORMULÁRIO QUANDO VISÍVEL =====
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

        // Preparar elementos para animação
        const formElements = contactFormSection.querySelectorAll('.form-group');
        formElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });

        formObserver.observe(contactFormSection);
    }

    // ===== 17. REDIRECIONAMENTO DO BLOG PARA CONTATO =====
    document.querySelectorAll('.read-more[href="#contato"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Scroll suave para o formulário
            const formSection = document.querySelector('#contato');
            if (formSection) {
                const headerHeight = document.querySelector('.main-nav').offsetHeight;
                const targetPosition = formSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Focar no campo de mensagem
                setTimeout(() => {
                    const mensagemField = document.getElementById('mensagem');
                    if (mensagemField) {
                        const articleTitle = this.closest('.article-content').querySelector('h3').textContent;
                        mensagemField.placeholder = `Gostaria de consultoria sobre: ${articleTitle}`;
                        mensagemField.focus();
                    }
                }, 800);
            }
        });
    });

    // ===== 18. ANIMAÇÃO DO MARCOS DO TIMELINE =====
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

    // ===== 19. ENVIAR EMAIL PELO FOOTER =====
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

    // ===== 20. ANIMAÇÃO DO LOGO NO HOVER =====
    const logo = document.querySelector('.logo img');
    if (logo) {
        logo.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.05) rotate(-2deg)';
        });

        logo.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    }

    // ===== 21. VALIDAÇÃO DE FORMULÁRIO ADICIONAL =====
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

    // ===== 22. ANIMAÇÃO DO BOTÃO SUBMIT =====
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            // Efeito de clique
            this.style.transform = 'scale(0.95)';

            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    }

    // ===== 23. ATUALIZAR ANO NO FOOTER =====
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('[data-current-year]');
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });

    // ===== 24. ANIMAÇÃO DE ENTRADA PARA O HERO =====
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        setTimeout(() => {
            heroContent.classList.add('hero-visible');
        }, 300);
    }
});

// ===== 25. OBSERVADOR PARA ELEMENTOS COM ANIMAÇÃO PERSONALIZADA =====
const customObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Adicionar classe específica baseada no tipo de elemento
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

// ===== 26. OTIMIZAÇÃO DE PERFORMANCE PARA ANIMAÇÕES =====
let ticking = false;
window.addEventListener('scroll', function () {
    if (!ticking) {
        window.requestAnimationFrame(function () {
            // Atualizar posição do menu fixo
            const mainNav = document.querySelector('.main-nav');
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

// Adicionar classe loaded ao body quando tudo carregar
window.addEventListener('load', function () {
    document.body.classList.add('loaded');

    // Remover preloader se existir
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.display = 'none';
    }
});

// Tratamento de erros
window.addEventListener('error', function (e) {
    console.warn('Erro capturado:', e.message);

    // Não quebrar a experiência do usuário
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
    }
}, true);

// Ajustar comportamento baseado no tamanho da tela
window.addEventListener('resize', debounce(function () {
    if (isMobile()) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
    }
}, 250));

// ===== INICIALIZAÇÃO FINAL =====

// Inicializar estado mobile
if (isMobile()) {
    document.body.classList.add('mobile-view');
}

// Log de inicialização bem-sucedida
console.log('✅ Eric Macêdo Advogado - Site inicializado com sucesso!');