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
        this.effects.createTireMark(this.car);
        this.effects.updateEffects(deltaTime);
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
}

export default Game;
