class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        this.position = { x: 0, y: 0 };
        this.rotation = 0;
        this.smoothing = 0.1;
        this.lookAheadDistance = 100;
        
        // Screen position offset limits
        this.maxScreenRotation = Math.PI / 60; // 3 degrees
        this.screenOffset = { x: 0, y: 0 };
    }

    follow(car) {
        // Calculate screen offset based on turning (limited to 3 degrees)
        const targetScreenRotation = -car.steeringAngle * this.maxScreenRotation;
        const screenRotation = targetScreenRotation * (Math.abs(car.speed) / car.maxSpeed);
        
        // Calculate screen position offset
        this.screenOffset.x = Math.sin(screenRotation) * 100; // 100 pixels max side offset
        this.screenOffset.y = 0; // Keep vertical position fixed

        // Update camera position (world space)
        this.position.x = car.position.x;
        this.position.y = car.position.y;

        // Update world rotation (opposite of car angle to keep car pointing up)
        const targetRotation = -car.angle;
        this.rotation += (targetRotation - this.rotation) * this.smoothing;
    }

    transform(ctx) {
        const centerX = this.canvas.width / 2 + this.screenOffset.x;
        const centerY = this.canvas.height * 0.7 + this.screenOffset.y;
        
        // First translate to screen center
        ctx.translate(centerX, centerY);
        
        // Then rotate the world (opposite of car rotation)
        ctx.rotate(this.rotation);
        
        // Finally translate to negative camera position
        ctx.translate(-this.position.x, -this.position.y);
    }
}

export default Camera;
