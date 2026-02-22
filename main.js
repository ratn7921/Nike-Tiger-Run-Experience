/**
 * Nike Tiger Experience
 * Author: Antigravity AI
 * Specialized for Awwwards-winning scrollytelling.
 */

class TigerExperience {
    constructor() {
        this.canvas = document.getElementById('tiger-canvas');
        this.ambientCanvas = document.getElementById('ambient-canvas');
        this.context = this.canvas.getContext('2d');
        this.ambientContext = this.ambientCanvas.getContext('2d');

        this.frameCount = 242;
        this.images = [];
        this.renderState = { frame: 0 };

        this.init();
    }

    init() {
        this.initLenis();
        this.setupCanvases();
        this.preloadImages();
        this.setupScrollTrigger();
        this.handleResize();

        window.addEventListener('resize', () => this.handleResize());
    }

    initLenis() {
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            this.lenis.raf(time);
            requestAnimationFrame(raf.bind(this));
        }

        requestAnimationFrame(raf.bind(this));

        // Sync ScrollTrigger with Lenis
        this.lenis.on('scroll', ScrollTrigger.update);
    }

    setupCanvases() {
        // Set initial sizes
        this.handleResize();
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ambientCanvas.width = window.innerWidth;
        this.ambientCanvas.height = window.innerHeight;

        // Redraw current frame if images are loaded
        if (this.images[this.renderState.frame]) {
            this.render(this.renderState.frame);
        }
    }

    currentFrame(index) {
        // Assets are expected in assets/frames/ezgif-frame-001.jpg
        const frameId = (index + 1).toString().padStart(3, '0');
        return `assets/frames/ezgif-frame-${frameId}.jpg`;
    }

    preloadImages() {
        let loadedCount = 0;
        const total = this.frameCount;
        const fallbackSrc = 'https://images.unsplash.com/photo-1534188753412-3ee2f772eead?auto=format&fit=crop&q=80&w=2000';

        for (let i = 0; i < total; i++) {
            const img = new Image();
            img.src = this.currentFrame(i);
            img.onload = () => {
                loadedCount++;
                if (loadedCount === 1) {
                    this.render(0);
                }
            };
            img.onerror = () => {
                if (i === 0) {
                    // Use fallback if first frame fails
                    const fallbackImg = new Image();
                    fallbackImg.src = fallbackSrc;
                    fallbackImg.onload = () => {
                        this.images[0] = fallbackImg;
                        this.render(0);
                    };
                }
                console.warn(`Frame ${i} failed to load. Using fallback logic.`);
            };
            this.images.push(img);
        }
    }

    setupScrollTrigger() {
        gsap.registerPlugin(ScrollTrigger);

        // Control the frame sequence
        gsap.to(this.renderState, {
            frame: this.frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: ".hero-experience",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.5,
                onUpdate: (self) => {
                    this.render(Math.round(this.renderState.frame));
                }
            }
        });

        // Intro text animations
        gsap.from(".hero-text h1", {
            scale: 0.8,
            opacity: 0,
            duration: 2,
            ease: "expo.out",
            scrollTrigger: {
                trigger: ".hero-experience",
                start: "top center",
                end: "top 20%",
                scrub: true
            }
        });

        // Blur effect at the end of scroll
        ScrollTrigger.create({
            trigger: ".hero-experience",
            start: "bottom 20%",
            onEnter: () => this.canvas.classList.add('canvas-blur'),
            onLeaveBack: () => this.canvas.classList.remove('canvas-blur'),
        });

        // Product intro reveal
        gsap.from(".product-intro > div", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            scrollTrigger: {
                trigger: ".product-intro",
                start: "top 80%",
            }
        });
    }

    render(index) {
        const img = this.images[index];
        if (!img || !img.complete) return;

        // --- Render Foreground Canvas ---
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const canvasAspect = this.canvas.width / this.canvas.height;
        const imgAspect = img.width / img.height;

        let drawW, drawH, drawX, drawY;

        // object-fit: contain logic for foreground
        if (imgAspect > canvasAspect) {
            drawW = this.canvas.width;
            drawH = drawW / imgAspect;
        } else {
            drawH = this.canvas.height;
            drawW = drawH * imgAspect;
        }

        drawX = (this.canvas.width - drawW) / 2;
        drawY = (this.canvas.height - drawH) / 2;

        this.context.drawImage(img, drawX, drawY, drawW, drawH);

        // --- Render Ambient Background Canvas ---
        this.ambientContext.clearRect(0, 0, this.ambientCanvas.width, this.ambientCanvas.height);

        // object-fit: cover logic for background
        let ambW, ambH, ambX, ambY;
        if (imgAspect < canvasAspect) {
            ambW = this.ambientCanvas.width;
            ambH = ambW / imgAspect;
        } else {
            ambH = this.ambientCanvas.height;
            ambW = ambH * imgAspect;
        }

        // Zoom by 110% as requested
        ambW *= 1.1;
        ambH *= 1.1;

        ambX = (this.ambientCanvas.width - ambW) / 2;
        ambY = (this.ambientCanvas.height - ambH) / 2;

        this.ambientContext.drawImage(img, ambX, ambY, ambW, ambH);
    }

}

// Initialize the experience on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new TigerExperience();
});
