import Game from './game/Game';

function resizeCanvas() {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function updateUI(car) {
    document.getElementById('speed').textContent = 
        Math.round(Math.abs(car.speed) * 3.6); // Convert to km/h
    document.getElementById('pos').textContent = 
        `${Math.round(car.position.x)},${Math.round(car.position.y)}`;
    document.getElementById('angle').textContent = 
        Math.round(car.angle * 180 / Math.PI);
}

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const game = new Game(canvas);
    game.start();

    // Update UI 60 times per second
    setInterval(() => updateUI(game.car), 1000/60);
});
