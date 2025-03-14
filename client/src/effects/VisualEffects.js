class VisualEffects {
    constructor() {
        this.tireMarks = [];
        this.maxTireMarks = 3000;
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

    updateEffects(deltaTime) {
        // Fade tire marks
        this.tireMarks.forEach(mark => {
            mark.opacity = Math.max(0, mark.opacity - deltaTime * 0.005);
        });
        this.tireMarks = this.tireMarks.filter(mark => mark.opacity > 0);
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
    }
}

export default VisualEffects;
