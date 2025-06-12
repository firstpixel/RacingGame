class VisualEffects {
    constructor() {
        this.tireMarks = [];
        this.maxTireMarks = 3000;

        // Motion blur trail segments
        this.motionBlur = [];

        // Rain effect
        this.raindrops = [];
        this.isRaining = false;
    }

    createTireMark(car) {
        if (Math.abs(car.steeringAngle) > 0.7 && Math.abs(car.speed) > 100) {
            // Create two tire marks for left and right wheels
            [-15, 15].forEach(offset => {
                const mark = {
                    x: car.position.x + Math.cos(car.angle) * offset,
                    y: car.position.y + Math.sin(car.angle) * offset,
                    opacity: 0.1
                };
                this.tireMarks.push(mark);
            });
            
            while (this.tireMarks.length > this.maxTireMarks) {
                this.tireMarks.shift();
            }
        }
    }

    createMotionBlur(car) {
        if (Math.abs(car.speed) > 400) {
            this.motionBlur.push({
                x: car.position.x,
                y: car.position.y,
                angle: car.angle,
                opacity: 0.3
            });

            while (this.motionBlur.length > 20) {
                this.motionBlur.shift();
            }
        }
    }

    setRaining(enabled) {
        this.isRaining = enabled;
    }

    updateRain(car, deltaTime) {
        if (!this.isRaining) {
            this.raindrops = [];
            return;
        }

        for (let i = 0; i < 8; i++) {
            this.raindrops.push({
                x: car.position.x + (Math.random() * 800 - 400),
                y: car.position.y - 300,
                speed: 600 + Math.random() * 200
            });
        }

        this.raindrops.forEach(drop => {
            drop.y += drop.speed * deltaTime;
        });

        this.raindrops = this.raindrops.filter(drop => drop.y < car.position.y + 300);
    }

    updateEffects(deltaTime, car) {
        // Fade tire marks
        this.tireMarks.forEach(mark => {
            mark.opacity = Math.max(0, mark.opacity - deltaTime * 0.005);
        });
        this.tireMarks = this.tireMarks.filter(mark => mark.opacity > 0);

        // Fade motion blur
        this.motionBlur.forEach(seg => {
            seg.opacity = Math.max(0, seg.opacity - deltaTime * 2);
        });
        this.motionBlur = this.motionBlur.filter(seg => seg.opacity > 0);

        this.updateRain(car, deltaTime);
    }

    render(ctx) {
        // Draw tire marks
        ctx.save();
        this.tireMarks.forEach(mark => {
            ctx.fillStyle = `rgba(0, 0, 0, ${mark.opacity})`;
            ctx.beginPath();
            ctx.arc(mark.x, mark.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // Draw motion blur segments
        ctx.save();
        this.motionBlur.forEach(seg => {
            ctx.save();
            ctx.translate(seg.x, seg.y);
            ctx.rotate(seg.angle);
            ctx.globalAlpha = seg.opacity;
            ctx.fillStyle = '#4287f5';
            ctx.fillRect(-20, -40, 40, 80);
            ctx.restore();
        });
        ctx.restore();

        // Draw rain
        if (this.isRaining) {
            ctx.save();
            ctx.strokeStyle = 'rgba(180, 180, 255, 0.5)';
            ctx.lineWidth = 1;
            this.raindrops.forEach(drop => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x + 2, drop.y + 10);
                ctx.stroke();
            });
            ctx.restore();
        }
    }
}

export default VisualEffects;
