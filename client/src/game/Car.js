class Car {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        this.speed = 0;
        this.isAccelerating = false;
        this.isBraking = false;
        this.steeringAngle = 0;
        
        // Physics constants - adjusted for less drift
        this.maxSpeed = 200;
        this.acceleration = 0.5;
        this.deceleration = 0.3;
        this.friction = 0.98;
        this.turnSpeed = 0.03;
        this.driftFactor = 0.95; // Increased from 0.85 for less drift

        // Visual properties
        this.wheelAngle = 0;
        this.tireRotation = 0;
        this.tilt = 0;
        this.accelerationGlow = 0;
        
        // Animation constants
        this.maxWheelAngle = Math.PI / 4;
        this.maxTilt = 0.1;
        this.maxGlow = 1.0;
        this.tireRotationSpeed = 0.1;

        // Additional physics constants for front-wheel drive - adjusted for more grip
        this.wheelbase = 60; // Distance between front and rear axles
        this.frontGrip = 0.95; // Increased from 0.9
        this.rearGrip = 0.9; // Increased from 0.8
        this.inertia = 0.3; // Reduced from 0.5 for less sliding
        this.angularVelocity = 0; // Current turning speed
    }

    update(deltaTime) {
        // Handle acceleration
        if (this.isAccelerating) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else if (this.isBraking) {
            this.speed = Math.max(this.speed - this.deceleration, -this.maxSpeed * 0.5);
        } else {
            this.speed *= this.friction;
        }

        // Calculate front wheel position and forces
        const frontWheel = {
            x: Math.sin(this.angle + this.wheelAngle) * this.wheelbase * 0.5,
            y: -Math.cos(this.angle + this.wheelAngle) * this.wheelbase * 0.5
        };

        // Apply forces based on wheel angle and speed
        const turnForce = this.speed * Math.sin(this.wheelAngle) * this.frontGrip;
        this.angularVelocity += (turnForce / this.wheelbase) * this.inertia;
        this.angularVelocity *= 0.90;

        // Update angle based on angular velocity
        this.angle += this.angularVelocity * deltaTime;

        // Update wheel turning animation
        const targetWheelAngle = this.steeringAngle * this.maxWheelAngle;
        this.wheelAngle += (targetWheelAngle - this.wheelAngle) * 0.2;

        // Calculate velocity based on car's angle and speed
        const driftEffect = Math.abs(this.angularVelocity) > 1.0 ? this.driftFactor : 1;
        this.velocity.x = Math.sin(this.angle) * this.speed * driftEffect;  // Removed negative
        this.velocity.y = -Math.cos(this.angle) * this.speed * driftEffect; // Keep negative for correct direction
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Update tilt and glow effects
        const targetTilt = -this.steeringAngle * this.maxTilt * (this.speed / this.maxSpeed);
        this.tilt += (targetTilt - this.tilt) * 0.1;

        const targetGlow = this.isAccelerating ? this.maxGlow : 0;
        this.accelerationGlow += (targetGlow - this.accelerationGlow) * 0.2;
    }

    handleInput(keys) {
        this.isAccelerating = keys.ArrowUp;
        this.isBraking = keys.ArrowDown;
        this.steeringAngle = (keys.ArrowLeft ? -1 : 0) + (keys.ArrowRight ? 1 : 0);
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        ctx.rotate(this.tilt);

        // Draw car shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-22, -42, 44, 84);

        // Draw car body
        ctx.fillStyle = '#4287f5'; // Bright blue car
        ctx.fillRect(-20, -40, 40, 80);

        // Car details
        ctx.fillStyle = '#2961bd'; // Darker blue for details
        ctx.fillRect(-20, -30, 40, 10);
        ctx.fillRect(-20, 20, 40, 10);

        // Draw front wheels with rotation
        this.drawWheel(ctx, -15, -30, this.wheelAngle);
        this.drawWheel(ctx, 15, -30, this.wheelAngle);
        
        // Draw back wheels
        this.drawWheel(ctx, -15, 30, 0);
        this.drawWheel(ctx, 15, 30, 0);

        // Draw acceleration glow
        if (this.accelerationGlow > 0) {
            ctx.save();
            ctx.globalAlpha = this.accelerationGlow * 0.5;
            ctx.fillStyle = '#ffd700'; // Golden glow
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }

    drawWheel(ctx, x, y, steeringAngle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(steeringAngle);
        // No more tire rotation, just draw the wheel
        ctx.fillStyle = '#333333'; // Dark grey wheels
        ctx.fillRect(-5, -8, 10, 16);
        ctx.restore();
    }
}

export default Car;
