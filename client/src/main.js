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

let game = null;

function startGame(track) {
    const canvas = document.getElementById('gameCanvas');
    if (!game) {
        game = new Game(canvas, track);
        game.start();
        setInterval(() => updateUI(game), 1000/60);
    }
    document.getElementById('trackSelect').style.display = 'none';
}

window.addEventListener('load', () => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.getElementById('selectOval')
        .addEventListener('click', () => startGame('oval'));
    document.getElementById('selectInterlagos')
        .addEventListener('click', () => startGame('interlagos'));
});
