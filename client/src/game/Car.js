class Car {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        this.speed = 0;
        this.isAccelerating = false;
        this.isBraking = false;
        this.steeringAngle = 0;
        
        // Physics constants - adjusted for more momentum
        this.maxSpeed = 1000;
        this.acceleration = 2.5;
        this.deceleration = 2.5;
        this.friction = 0.995;       // Increased from 0.96 - Much less friction
        this.brakingFriction = 0.95; // Separate friction for braking
        this.turnSpeed = 0.03;
        this.driftFactor = 0.85;

        // Add momentum constants
        this.minSpeed = 0.1;         // Speed threshold before complete stop
        this.coastingFriction = 0.998; // Very low friction when coasting

        // Visual properties
        this.wheelAngle = 0;
        this.tireRotation = 0;
        this.tilt = 0;
        this.accelerationGlow = 0;
        
        // Animation constants
        this.maxWheelAngle = Math.PI / 4;
        this.maxTilt = -0.9;
        this.maxGlow = 200.0;
        this.tireRotationSpeed = 0.1;

        // Additional physics constants for front-wheel drive - adjusted for more grip
        this.wheelbase = 60; // Distance between front and rear axles
        this.frontGrip = 0.95; // Increased from 0.9
        this.rearGrip = 0.9; // Increased from 0.8
        this.inertia = 0.3; // Reduced from 0.5 for less sliding
        this.angularVelocity = 0; // Current turning speed

        // Add steering speed reduction factor
        this.steeringSpeedReduction = 0.9; // Reduces steering at high speeds
        this.baseSteeringSpeed = this.turnSpeed; // Store original turn speed

        // Add centripetal force constants
        this.centripetalForceFactor = 0.8;  // Increased from 0.4 - More speed loss in turns
        this.speedTurnThreshold = 0.4;      // Reduced from 0.6 - Start losing speed earlier in turns
        this.driftThreshold = 0.7;          // Reduced from 0.8 - Start drifting earlier
        this.maxDriftAngle = 0.3;           // Increased from 0.2 - More pronounced drift
        this.driftRecoveryRate = 0.92;      // Reduced from 0.95 - Slower drift recovery
        this.driftAngle = 0;                // Current drift angle

        this.isWet = false;
    }

    update(deltaTime) {
        const accel = this.isWet ? this.acceleration * 0.7 : this.acceleration;
        const decel = this.isWet ? this.deceleration * 0.9 : this.deceleration;
        const brakeFriction = this.isWet ? this.brakingFriction * 0.9 : this.brakingFriction;
        const coastFriction = this.isWet ? this.coastingFriction * 0.995 : this.coastingFriction;

        // Handle acceleration and momentum
        if (this.isAccelerating) {
            this.speed = Math.min(this.speed + accel, this.maxSpeed);
        } else if (this.isBraking) {
            // Apply stronger friction when braking
            this.speed = Math.max(this.speed - decel, -this.maxSpeed * 0.5);
            this.speed *= brakeFriction;
        } else {
            // Coasting - apply very low friction
            if (Math.abs(this.speed) > this.minSpeed) {
                this.speed *= coastFriction;
            } else {
                this.speed = 0; // Stop completely below threshold
            }
        }

        // Calculate speed reduction from turning (centripetal force)
        const speedFactor = Math.abs(this.speed) / this.maxSpeed;
        if (speedFactor > this.speedTurnThreshold && Math.abs(this.steeringAngle) > 0) {
            const turnIntensity = Math.abs(this.steeringAngle);
            const speedReduction = turnIntensity * this.centripetalForceFactor * 
                                 (speedFactor - this.speedTurnThreshold) * this.speed;
            this.speed = Math.max(0, this.speed - speedReduction * deltaTime);
        }

        // Calculate drift effect at high speeds
        if (speedFactor > this.driftThreshold && Math.abs(this.steeringAngle) > 0) {
            const driftIntensity = (speedFactor - this.driftThreshold) * 
                                 Math.abs(this.steeringAngle);
            const targetDrift = this.maxDriftAngle * driftIntensity * Math.sign(this.steeringAngle);
            this.driftAngle += (targetDrift - this.driftAngle) * 0.1;
        } else {
            this.driftAngle *= this.driftRecoveryRate;
        }

        // Adjust steering speed based on current speed
        const steeringReduction = 1 - (speedFactor * this.steeringSpeedReduction);
        const gripMult = this.isWet ? 0.8 : 1;

        // Calculate front wheel position and forces
        const frontWheel = {
            x: Math.sin(this.angle + this.wheelAngle) * this.wheelbase * 0.5,
            y: -Math.cos(this.angle + this.wheelAngle) * this.wheelbase * 0.5
        };

        // Apply forces based on wheel angle and adjusted speed
        const turnForce = this.speed * Math.sin(this.wheelAngle) * this.frontGrip * gripMult * steeringReduction;
        this.angularVelocity += (turnForce / this.wheelbase) * this.inertia;
        this.angularVelocity *= 0.90;

        // Update angle including drift
        this.angle += (this.angularVelocity + this.driftAngle) * deltaTime;

        // Update wheel turning animation with speed-based reduction
        const targetWheelAngle = this.steeringAngle * this.maxWheelAngle * steeringReduction;
        this.wheelAngle += (targetWheelAngle - this.wheelAngle) * 0.2;

        // Calculate velocity based on car's angle and speed
        const totalAngle = this.angle + this.driftAngle;
        const driftFact = this.isWet ? this.driftFactor * 1.2 : this.driftFactor;
        const driftEffect = Math.abs(this.angularVelocity) > 1.0 ? driftFact : 1;
        this.velocity.x = Math.sin(totalAngle) * this.speed * driftEffect;  // Removed negative
        this.velocity.y = -Math.cos(totalAngle) * this.speed * driftEffect; // Keep negative for correct direction

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Update tire rotation based on speed
        this.tireRotation += Math.abs(this.speed) * this.tireRotationSpeed * deltaTime;

        // Update tilt and glow effects
        const targetTilt = -this.steeringAngle * this.maxTilt * (this.speed / this.maxSpeed);
        this.tilt += (targetTilt - this.tilt) * 0.1;

        const targetGlow = this.isAccelerating * 10 ? this.maxGlow : 0;
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
            ctx.blur =  this.accelerationGlow * 0.5;
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
        ctx.fillStyle = '#333333'; // Dark grey wheels
        ctx.fillRect(-5, -8, 10, 16);

        // Draw simple tread lines to show rotation
        ctx.save();
        ctx.rotate(this.tireRotation);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 8);
        ctx.moveTo(-4, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();
        ctx.restore();

        // Wheel glow when accelerating
        if (this.isAccelerating) {
            ctx.fillStyle = 'rgba(255, 255, 150, 0.5)';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

export default Car;
