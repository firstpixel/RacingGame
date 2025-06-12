import Game from './game/Game';

function resizeCanvas() {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function updateUI(game) {
    const car = game.car;
    document.getElementById('speed').textContent =
        Math.round(Math.abs(car.speed) * 3.6); // Convert to km/h
    document.getElementById('pos').textContent =
        `${Math.round(car.position.x)},${Math.round(car.position.y)}`;
    document.getElementById('angle').textContent =
        Math.round(car.angle * 180 / Math.PI);
    document.getElementById('lapCount').textContent = game.lapCount;
    document.getElementById('totalLaps').textContent = game.totalLaps;
}

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const game = new Game(canvas, 'oval');
    game.start();

    // Update UI 60 times per second
    setInterval(() => updateUI(game), 1000/60);
});
