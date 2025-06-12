import Car from './Car';
import Camera from './Camera';
import VisualEffects from '../effects/VisualEffects';
import Track from './Track';

class Game {
    constructor(canvas, trackName = 'oval') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.car = new Car();
        this.car.position = { x: 0, y: 0 }; // Start at center
        this.camera = new Camera(canvas);
        this.effects = new VisualEffects();
        this.track = new Track(trackName);
        this.keys = {};
        this.lastTime = 0;
        this.prevCarPos = { x: 0, y: 0 };
        this.lapCount = 0;
        this.totalLaps = 3;

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

        this.prevCarPos = { x: this.car.position.x, y: this.car.position.y };
        this.car.handleInput(this.keys);
        this.car.update(deltaTime);
        this.camera.follow(this.car);
        this.checkTrackBounds();
        if (this.track.crossedFinish(this.prevCarPos, this.car.position)) {
            this.lapCount += 1;
        }
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
        
        // Draw loaded track
        if (this.track.outerPath) {
            this.track.render(this.ctx);
        }
        
        this.effects.render(this.ctx);
        this.car.render(this.ctx);
        
        this.ctx.restore();
    }

    gameLoop(timestamp) {
        this.update(timestamp);
        this.render();
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    async start() {
        await this.track.load();
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    checkTrackBounds() {
        if (!this.track.isPointOnTrack(this.ctx, this.car.position.x, this.car.position.y)) {
            this.car.position.x = this.prevCarPos.x;
            this.car.position.y = this.prevCarPos.y;
            this.car.speed *= 0.5;
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
