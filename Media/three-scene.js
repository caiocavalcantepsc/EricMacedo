import * as THREE from 'three';

(function () {
    'use strict';

    // ---------- Feature detection ----------
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const deviceMemory = navigator.deviceMemory || 8;

    // WebGL disponível?
    function hasWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    // Desativa tudo se não fizer sentido
    if (prefersReducedMotion || !hasWebGL() || (isMobile && (isLowPower || deviceMemory <= 2))) {
        document.body.classList.add('three-disabled');
        return;
    }

    document.body.classList.add('three-enabled');

    // ---------- Paleta (sincronizada com o CSS) ----------
    const ACCENT = 0x0066ff;
    const ACCENT_DARK = 0x0033aa;
    const INK = 0xf0f0f2;

    // ---------- Estado global ----------
    const scenes = new Map(); // element -> { renderer, scene, camera, ... }

    // ---------- Utilidades ----------
    function makeRenderer(container) {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.display = 'block';
        container.appendChild(renderer.domElement);
        return renderer;
    }

    function resizeRenderer(renderer, camera, container) {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    // =========================================================
    // 1) HERO — PARTÍCULAS DE FUNDO
    // =========================================================
    function initHeroParticles(container) {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.z = 12;

        const renderer = makeRenderer(container);

        // Campo de partículas
        const count = isMobile ? 900 : 1800;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const colorA = new THREE.Color(ACCENT);
        const colorB = new THREE.Color(INK);

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            const mix = Math.random();
            const c = colorA.clone().lerp(colorB, mix);
            colors[i * 3]     = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Sprite circular suave
        const spriteCanvas = document.createElement('canvas');
        spriteCanvas.width = spriteCanvas.height = 64;
        const ctx = spriteCanvas.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.4, 'rgba(255,255,255,0.6)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        const spriteTex = new THREE.CanvasTexture(spriteCanvas);

        const mat = new THREE.PointsMaterial({
            size: 0.16,
            map: spriteTex,
            transparent: true,
            depthWrite: false,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.9
        });

        const points = new THREE.Points(geo, mat);
        scene.add(points);

        resizeRenderer(renderer, camera, container);

        return {
            scene, camera, renderer,
            update(time, mouse) {
                points.rotation.y = time * 0.03;
                points.rotation.x = mouse.y * 0.05;
                points.rotation.z = mouse.x * 0.02;
            },
            resize() { resizeRenderer(renderer, camera, container); }
        };
    }

    // =========================================================
    // 2) HERO — NÓ TOROIDAL 3D
    // =========================================================
    function initHeroKnot(container) {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.z = 6;

        const renderer = makeRenderer(container);

        // TorusKnot wireframe + núcleo
        const geo = new THREE.TorusKnotGeometry(1.35, 0.42, 200, 32, 2, 3);

        const wireMat = new THREE.MeshBasicMaterial({
            color: ACCENT,
            wireframe: true,
            transparent: true,
            opacity: 0.55
        });
        const knot = new THREE.Mesh(geo, wireMat);
        scene.add(knot);

        const coreMat = new THREE.MeshBasicMaterial({
            color: ACCENT_DARK,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending
        });
        const core = new THREE.Mesh(geo, coreMat);
        core.scale.setScalar(0.92);
        scene.add(core);

        // Halo externo
        const haloMat = new THREE.MeshBasicMaterial({
            color: ACCENT,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const halo = new THREE.Mesh(new THREE.SphereGeometry(2.6, 32, 32), haloMat);
        scene.add(halo);

        resizeRenderer(renderer, camera, container);

        return {
            scene, camera, renderer,
            update(time, mouse) {
                knot.rotation.x = time * 0.35;
                knot.rotation.y = time * 0.55;
                core.rotation.x = -time * 0.2;
                core.rotation.y = time * 0.3;
                knot.position.x = mouse.x * 0.4;
                knot.position.y = mouse.y * 0.3;
                halo.scale.setScalar(1 + Math.sin(time * 1.4) * 0.04);
            },
            resize() { resizeRenderer(renderer, camera, container); }
        };
    }

    // =========================================================
    // 3) ABOUT — ESFERA DE PARTÍCULAS
    // =========================================================
    function initAboutSphere(container) {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.z = 5;

        const renderer = makeRenderer(container);

        // Partículas distribuídas na superfície de uma esfera
        const count = isMobile ? 1200 : 2600;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const radius = 1.8;

        const colorAccent = new THREE.Color(ACCENT);
        const colorInk = new THREE.Color(INK);

        for (let i = 0; i < count; i++) {
            // Fibonacci sphere (distribuição uniforme)
            const phi = Math.acos(1 - 2 * (i + 0.5) / count);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const r = radius + (Math.random() - 0.5) * 0.08;
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            const mix = Math.random() * 0.6 + 0.2;
            const c = colorAccent.clone().lerp(colorInk, mix);
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.045,
            vertexColors: true,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const sphere = new THREE.Points(geo, mat);
        scene.add(sphere);

        // Anel orbital
        const ringGeo = new THREE.RingGeometry(2.15, 2.18, 96);
        const ringMat = new THREE.MeshBasicMaterial({
            color: ACCENT,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.4;
        scene.add(ring);

        const ring2 = ring.clone();
        ring2.rotation.x = Math.PI / 1.7;
        ring2.rotation.y = Math.PI / 3;
        ring2.material = ringMat.clone();
        ring2.material.opacity = 0.2;
        scene.add(ring2);

        resizeRenderer(renderer, camera, container);

        return {
            scene, camera, renderer,
            update(time, mouse) {
                sphere.rotation.y = time * 0.18;
                sphere.rotation.x = Math.sin(time * 0.3) * 0.15 + mouse.y * 0.1;
                ring.rotation.z = time * 0.22;
                ring2.rotation.z = -time * 0.18;
            },
            resize() { resizeRenderer(renderer, camera, container); }
        };
    }

    // =========================================================
    // 4) SKILLS — CUBO WIREFRAME INTERATIVO
    // =========================================================
    function initSkillsCube(container) {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.set(0, 0, 5.2);

        const renderer = makeRenderer(container);

        // Cubo externo wireframe
        const outerGeo = new THREE.BoxGeometry(2.6, 2.6, 2.6);
        const edges = new THREE.EdgesGeometry(outerGeo);
        const outerMat = new THREE.LineBasicMaterial({
            color: ACCENT,
            transparent: true,
            opacity: 0.75
        });
        const outer = new THREE.LineSegments(edges, outerMat);
        scene.add(outer);

        // Cubo interno (sólido sutil)
        const innerGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
        const innerMat = new THREE.MeshBasicMaterial({
            color: ACCENT_DARK,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending
        });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        scene.add(inner);

        // Vértices brilhantes nas pontas do cubo externo
        const vCount = 8;
        const vPositions = new Float32Array(vCount * 3);
        const half = 1.3;
        let idx = 0;
        [-half, half].forEach(x => {
            [-half, half].forEach(y => {
                [-half, half].forEach(z => {
                    vPositions[idx++] = x;
                    vPositions[idx++] = y;
                    vPositions[idx++] = z;
                });
            });
        });

        const vGeo = new THREE.BufferGeometry();
        vGeo.setAttribute('position', new THREE.BufferAttribute(vPositions, 3));
        const vMat = new THREE.PointsMaterial({
            color: INK,
            size: 0.13,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const vertices = new THREE.Points(vGeo, vMat);
        scene.add(vertices);

        // Linhas de conexão extras (orbitais diagonais)
        const linesGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-2.2, -2.2, 0), new THREE.Vector3(2.2, 2.2, 0),
            new THREE.Vector3(-2.2, 2.2, 0), new THREE.Vector3(2.2, -2.2, 0),
            new THREE.Vector3(0, -2.2, 2.2), new THREE.Vector3(0, 2.2, -2.2),
            new THREE.Vector3(0, 2.2, 2.2), new THREE.Vector3(0, -2.2, -2.2)
        ]);
        const linesMat = new THREE.LineBasicMaterial({
            color: ACCENT,
            transparent: true,
            opacity: 0.18
        });
        const lines = new THREE.LineSegments(linesGeo, linesMat);
        scene.add(lines);

        resizeRenderer(renderer, camera, container);

        return {
            scene, camera, renderer,
            update(time, mouse) {
                outer.rotation.x = time * 0.22;
                outer.rotation.y = time * 0.32;
                inner.rotation.x = -time * 0.4;
                inner.rotation.y = time * 0.5;
                vertices.rotation.copy(outer.rotation);
                lines.rotation.y = -time * 0.15;

                outer.position.x = mouse.x * 0.5;
                outer.position.y = mouse.y * 0.35;
                inner.position.copy(outer.position);
                vertices.position.copy(outer.position);
            },
            resize() { resizeRenderer(renderer, camera, container); }
        };
    }

    // =========================================================
// 5) HERO — LAPTOP 3D COM CÓDIGO NA TELA
// =========================================================
function initHeroLaptop(container) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.6, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = makeRenderer(container);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // ---------- Grupo do laptop ----------
    const laptop = new THREE.Group();
    laptop.rotation.set(-0.15, 0.35, 0);
    scene.add(laptop);

    // ==========================================================
    // TEXTURA DA TELA — código renderizado num canvas 2D
    // ==========================================================
    function createScreenTexture() {
        const W = 1600;
        const H = 1000;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // Fundo escuro elegante (gradiente sutil)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#0e0e14');
        bgGrad.addColorStop(1, '#0a0a0f');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Barra superior (tipo editor)
        ctx.fillStyle = '#141419';
        ctx.fillRect(0, 0, W, 62);
        // Dot buttons
        const dots = [
            { x: 42, c: '#ec6a5e' },
            { x: 74, c: '#f4bf4f' },
            { x: 106, c: '#61c454' }
        ];
        dots.forEach(d => {
            ctx.beginPath();
            ctx.arc(d.x, 31, 9, 0, Math.PI * 2);
            ctx.fillStyle = d.c;
            ctx.fill();
        });

        // Nome do arquivo
        ctx.fillStyle = '#6e6e78';
        ctx.font = '500 22px "JetBrains Mono", "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('script.js', W / 2, 39);
        ctx.textAlign = 'left';

        // Sidebar (números de linha)
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 62, 80, H - 62);
        ctx.fillStyle = '#3c3c44';
        ctx.font = '500 24px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        for (let i = 0; i < 20; i++) {
            ctx.fillText(String(i + 1).padStart(2, '0'), 62, 130 + i * 44);
        }
        ctx.textAlign = 'left';

        // ---------- Código ----------
        const code = [
            [{ t: 'while', c: '#0066ff', w: 600 }, { t: ' (businessAlive) {', c: '#b0b0b8', w: 400 }],
            [{ t: '  sell', c: '#f0f0f2', w: 500 }, { t: '();', c: '#b0b0b8', w: 400 }],
            [{ t: '  convert', c: '#f0f0f2', w: 500 }, { t: '();', c: '#b0b0b8', w: 400 }],
            [{ t: '  scale', c: '#f0f0f2', w: 500 }, { t: '();', c: '#b0b0b8', w: 400 }],
            [{ t: '}', c: '#b0b0b8', w: 400 }],
            [{ t: '', c: '#b0b0b8', w: 400 }],
            [{ t: 'function', c: '#0066ff', w: 600 }, { t: ' sell', c: '#f0f0f2', w: 500 }, { t: '() {', c: '#b0b0b8', w: 400 }],
            [{ t: '  return', c: '#0066ff', w: 600 }, { t: ' {', c: '#b0b0b8', w: 400 }],
            [{ t: '    customers', c: '#f0f0f2', w: 500 }, { t: ': ', c: '#b0b0b8', w: 400 }, { t: '"while you sleep"', c: '#3dd68c', w: 400 }, { t: ',', c: '#b0b0b8', w: 400 }],
            [{ t: '    revenue', c: '#f0f0f2', w: 500 }, { t: ': ', c: '#b0b0b8', w: 400 }, { t: '"while you live"', c: '#3dd68c', w: 400 }, { t: ',', c: '#b0b0b8', w: 400 }],
            [{ t: '    reach', c: '#f0f0f2', w: 500 }, { t: ': ', c: '#b0b0b8', w: 400 }, { t: '"global"', c: '#3dd68c', w: 400 }],
            [{ t: '  };', c: '#b0b0b8', w: 400 }],
            [{ t: '}', c: '#b0b0b8', w: 400 }],
            [{ t: '', c: '#b0b0b8', w: 400 }],
            [{ t: 'function', c: '#0066ff', w: 600 }, { t: ' convert', c: '#f0f0f2', w: 500 }, { t: '() {', c: '#b0b0b8', w: 400 }],
            [{ t: '  console', c: '#f0f0f2', w: 500 }, { t: '.log(', c: '#b0b0b8', w: 400 }, { t: '"💻 Your store never closes."', c: '#3dd68c', w: 400 }, { t: ');', c: '#b0b0b8', w: 400 }],
            [{ t: '}', c: '#b0b0b8', w: 400 }],
            [{ t: '', c: '#b0b0b8', w: 400 }],
            [{ t: 'sell', c: '#f0f0f2', w: 500 }, { t: '();', c: '#b0b0b8', w: 400 }],
            [{ t: 'const', c: '#0066ff', w: 600 }, { t: ' results = ', c: '#b0b0b8', w: 400 }, { t: 'sell', c: '#f0f0f2', w: 500 }, { t: '();', c: '#b0b0b8', w: 400 }],
            [{ t: 'console', c: '#f0f0f2', w: 500 }, { t: '.log(', c: '#b0b0b8', w: 400 }, { t: 'results', c: '#f0f0f2', w: 500 }, { t: ');', c: '#b0b0b8', w: 400 }]
        ];

        let y = 128;
        code.forEach(line => {
            let x = 110;
            line.forEach(seg => {
                ctx.font = `${seg.w} 24px "JetBrains Mono", "Fira Code", monospace`;
                ctx.fillStyle = seg.c;
                ctx.fillText(seg.t, x, y);
                x += ctx.measureText(seg.t).width;
            });
            y += 44;
        });

        // Cursor piscante no final
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(110, y - 20, 14, 26);

        // Brilho sutil no topo da tela (reflexo)
        const glow = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, W * 0.7);
        glow.addColorStop(0, 'rgba(0, 102, 255, 0.10)');
        glow.addColorStop(1, 'rgba(0, 102, 255, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        return tex;
    }

    // ==========================================================
    // ESTRUTURA DO LAPTOP
    // ==========================================================

    // ---- TAMPA (tela) ----
    const screenW = 3.6;
    const screenH = 2.25;
    const lidThickness = 0.08;

    // Painel externo (parte de trás da tampa) — alumínio escuro
    const lidMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1f,
        roughness: 0.45,
        metalness: 0.85
    });

    const lid = new THREE.Mesh(
        new THREE.BoxGeometry(screenW, screenH, lidThickness),
        lidMat
    );
    // Posiciona a tampa: parte de trás fica no eixo Y, girada no X pra ficar inclinada
    lid.position.set(0, screenH / 2, 0);
    // Pivot no fundo (bisagra): recuamos a geometria
    lid.geometry.translate(0, screenH / 2, 0);
    lid.position.set(0, 0, 0);

    const lidGroup = new THREE.Group();
    lidGroup.add(lid);
    // Inclina a tampa pra trás (ângulo do laptop aberto)
    lidGroup.rotation.x = -Math.PI / 2.6; // ~110°
    lidGroup.position.set(0, 0, 0);
    laptop.add(lidGroup);

    // Tela (plano com textura)
    const screenGeo = new THREE.PlaneGeometry(screenW * 0.94, screenH * 0.94);
    const screenMat = new THREE.MeshBasicMaterial({
        map: createScreenTexture(),
        toneMapped: false
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, screenH / 2, lidThickness / 2 + 0.001);
    lid.add(screen);

    // Borda luminosa em volta da tela
    const borderGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(screenW, screenH));
    const borderMat = new THREE.LineBasicMaterial({
        color: 0x0066ff,
        transparent: true,
        opacity: 0.65
    });
    const border = new THREE.LineSegments(borderGeo, borderMat);
    border.position.copy(screen.position);
    border.position.z += 0.002;
    lid.add(border);

    // Brilho/glow ao redor da tela
    const screenGlowMat = new THREE.MeshBasicMaterial({
        color: 0x0066ff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const screenGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(screenW * 1.15, screenH * 1.15),
        screenGlowMat
    );
    screenGlow.position.set(0, screenH / 2, lidThickness / 2 - 0.01);
    lid.add(screenGlow);

    // ---- BASE (teclado) ----
    const baseW = screenW;
    const baseD = 2.5;
    const baseH = 0.13;

    const baseMat = new THREE.MeshStandardMaterial({
        color: 0x141418,
        roughness: 0.35,
        metalness: 0.9
    });

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(baseW, baseH, baseD),
        baseMat
    );
    base.position.set(0, -baseH / 2, baseD / 2);
    laptop.add(base);

    // Borda luminosa da base
    const baseEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(baseW, baseH, baseD)),
        new THREE.LineBasicMaterial({
            color: 0x0066ff,
            transparent: true,
            opacity: 0.4
        })
    );
    baseEdges.position.copy(base.position);
    laptop.add(baseEdges);

    // "Teclado" — grade sutil em cima da base
    const keysGroup = new THREE.Group();
    const keyRows = 5;
    const keyCols = 14;
    const keyGap = 0.02;
    const keyW = (baseW * 0.85) / keyCols - keyGap;
    const keyD = (baseD * 0.55) / keyRows - keyGap;
    const keyMat = new THREE.MeshBasicMaterial({
        color: 0x2a2a30,
        transparent: true,
        opacity: 0.85
    });
    for (let r = 0; r < keyRows; r++) {
        for (let c = 0; c < keyCols; c++) {
            const key = new THREE.Mesh(
                new THREE.PlaneGeometry(keyW, keyD),
                keyMat
            );
            key.rotation.x = -Math.PI / 2;
            key.position.set(
                -baseW * 0.425 + c * (keyW + keyGap) + keyW / 2,
                0.002,
                baseD * 0.15 + r * (keyD + keyGap) + keyD / 2
            );
            keysGroup.add(key);
        }
    }
    laptop.add(keysGroup);

    // Trackpad
    const trackpad = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 0.55),
        new THREE.MeshStandardMaterial({
            color: 0x1e1e24,
            roughness: 0.2,
            metalness: 0.5
        })
    );
    trackpad.rotation.x = -Math.PI / 2;
    trackpad.position.set(0, 0.003, baseD * 0.78);
    laptop.add(trackpad);

    // Borda do trackpad
    const trackpadEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.9, 0.55)),
        new THREE.LineBasicMaterial({
            color: 0x0066ff,
            transparent: true,
            opacity: 0.3
        })
    );
    trackpadEdges.rotation.x = -Math.PI / 2;
    trackpadEdges.position.copy(trackpad.position);
    trackpadEdges.position.y += 0.001;
    laptop.add(trackpadEdges);

    // ---- Sombra/reflexo embaixo do laptop ----
    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x0066ff,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending
    });
    const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(baseW * 1.6, baseD * 1.6),
        shadowMat
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -0.2, baseD / 2);
    laptop.add(shadow);

    // ---- Partículas orbitando (efeito tech) ----
    const particleCount = 80;
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 2.8 + Math.random() * 1.5;
        const height = (Math.random() - 0.5) * 3;
        pPositions[i * 3]     = Math.cos(angle) * radius;
        pPositions[i * 3 + 1] = height;
        pPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        color: 0x0066ff,
        size: 0.035,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }));
    laptop.add(particles);

    // ---- Luzes ----
    const keyLight = new THREE.PointLight(0x0066ff, 3.5, 15);
    keyLight.position.set(2.5, 3, 3);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xffffff, 1.2, 12);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    resizeRenderer(renderer, camera, container);

    return {
        scene, camera, renderer,
        update(time, mouse) {
            // Rotação base + reação suave ao mouse
            const targetRotY = 0.35 + mouse.x * 0.35;
            const targetRotX = -0.15 + mouse.y * 0.12;

            laptop.rotation.y += (targetRotY - laptop.rotation.y) * 0.05;
            laptop.rotation.x += (targetRotX - laptop.rotation.x) * 0.05;

            // Flutuação suave
            laptop.position.y = Math.sin(time * 0.9) * 0.08;

            // Partículas orbitando
            particles.rotation.y = time * 0.15;
            particles.rotation.x = Math.sin(time * 0.3) * 0.1;

            // Glow pulsante na tela
            screenGlow.material.opacity = 0.10 + Math.sin(time * 2) * 0.04;
        },
        resize() { resizeRenderer(renderer, camera, container); }
    };
}

    // =========================================================
    // REGISTRO + LAZY INIT + LOOP GLOBAL
    // =========================================================
    const factories = {
        'hero-particles': initHeroParticles,
        'hero-knot': initHeroKnot,
        'about-sphere': initAboutSphere,
        'hero-laptop': initHeroLaptop, 
        'skills-cube': initSkillsCube
    };

    const wraps = document.querySelectorAll('.three-canvas-wrap[data-three]');

    // Mouse global (suavizado)
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('mousemove', (e) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });

    // Inicializa quando entra na viewport (lazy)
    const visibility = new Map();

    wraps.forEach((wrap) => {
        const key = wrap.dataset.three;
        const factory = factories[key];
        if (!factory) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (!visibility.get(wrap)) {
                        try {
                            const instance = factory(wrap);
                            visibility.set(wrap, { instance, visible: true });
                            wrap.classList.add('is-ready');
                        } catch (err) {
                            console.warn('[three] falha ao iniciar', key, err);
                            wrap.style.display = 'none';
                        }
                    } else {
                        visibility.get(wrap).visible = true;
                    }
                } else if (visibility.get(wrap)) {
                    visibility.get(wrap).visible = false;
                }
            });
        }, { rootMargin: '120px', threshold: 0.01 });

        observer.observe(wrap);
    });

    // Resize global (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            visibility.forEach((_, wrap) => {
                const v = visibility.get(wrap);
                if (v && v.instance.resize) v.instance.resize();
            });
        }, 150);
    });

    // Loop de render unificado
    const clock = new THREE.Clock();

    function renderLoop() {
        requestAnimationFrame(renderLoop);

        // suavização do mouse
        mouse.x += (mouse.tx - mouse.x) * 0.06;
        mouse.y += (mouse.ty - mouse.y) * 0.06;

        const t = clock.getElapsedTime();

        visibility.forEach((wrap) => {
            const v = visibility.get(wrap);
            if (!v || !v.visible || !v.instance) return;
            v.instance.update(t, mouse);
            v.instance.renderer.render(v.instance.scene, v.instance.camera);
        });
    }

    renderLoop();

})();