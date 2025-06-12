import Car from './Car';
import Camera from './Camera';
import VisualEffects from '../effects/VisualEffects';

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.car = new Car();
        this.car.position = { x: 0, y: 0 }; // Start at center
        this.camera = new Camera(canvas);
        this.effects = new VisualEffects();
        this.keys = {};
        this.lastTime = 0;

        // Rain state
        this.isRaining = false;
        this.rainTimer = 0;
        this.nextRainTime = 5 + Math.random() * 10;
        this.rainDuration = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    update(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.car.handleInput(this.keys);
        this.car.update(deltaTime);
        this.camera.follow(this.car);
        this.checkTrackBounds();
        this.handleRain(deltaTime);
        this.effects.createTireMark(this.car);
        this.effects.createMotionBlur(this.car);
        this.effects.updateEffects(deltaTime, this.car);
    }

    render() {
        // Clear with a dark blue background
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.camera.transform(this.ctx);
        
        // Draw track with grass and asphalt
        // Grass background
        this.ctx.fillStyle = '#2d572c';
        this.ctx.fillRect(-1000, -1000, 2000, 2000);
        
        // Track/asphalt
        this.ctx.fillStyle = '#666666';
        this.ctx.fillRect(-200, -1000, 400, 2000);
        
        // Track markings (white lines)
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(-200, -1000);
        this.ctx.lineTo(-200, 1000);
        this.ctx.moveTo(200, -1000);
        this.ctx.lineTo(200, 1000);
        this.ctx.stroke();
        
        this.effects.render(this.ctx);
        this.car.render(this.ctx);
        
        this.ctx.restore();
    }

    gameLoop(timestamp) {
        this.update(timestamp);
        this.render();
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    start() {
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    checkTrackBounds() {
        const bounds = { left: -200, right: 200, top: -1000, bottom: 1000 };
        const halfWidth = 20;
        const halfHeight = 40;
        let collided = false;

        if (this.car.position.x - halfWidth < bounds.left) {
            this.car.position.x = bounds.left + halfWidth;
            collided = true;
        }
        if (this.car.position.x + halfWidth > bounds.right) {
            this.car.position.x = bounds.right - halfWidth;
            collided = true;
        }
        if (this.car.position.y - halfHeight < bounds.top) {
            this.car.position.y = bounds.top + halfHeight;
            collided = true;
        }
        if (this.car.position.y + halfHeight > bounds.bottom) {
            this.car.position.y = bounds.bottom - halfHeight;
            collided = true;
        }

        if (collided) {
            this.car.speed *= -0.3;
        }
    }

    handleRain(deltaTime) {
        this.rainTimer += deltaTime;

        if (!this.isRaining && this.rainTimer >= this.nextRainTime) {
            this.isRaining = true;
            this.rainDuration = 5 + Math.random() * 5;
            this.rainTimer = 0;
            this.car.isWet = true;
            this.effects.setRaining(true);
        } else if (this.isRaining && this.rainTimer >= this.rainDuration) {
            this.isRaining = false;
            this.nextRainTime = 10 + Math.random() * 10;
            this.rainTimer = 0;
            this.car.isWet = false;
            this.effects.setRaining(false);
        }
    }
}

export default Game;
