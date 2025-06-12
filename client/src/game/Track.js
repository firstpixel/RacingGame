class Track {
    constructor(name) {
        this.name = name;
        this.outerPath = null;
        this.innerPath = null;
        this.finishLinePath = null;
        this.startLineRect = null;
        this.viewBox = [0,0,0,0];
    }

    async load() {
        const res = await fetch(`tracks/${this.name}.svg`);
        const text = await res.text();
        const parser = new DOMParser();
        const svg = parser.parseFromString(text, 'image/svg+xml');
        const vb = svg.documentElement.getAttribute('viewBox');
        if (vb) {
            this.viewBox = vb.split(/\s+/).map(Number);
        }
        const outer = svg.getElementById('outer');
        const inner = svg.getElementById('inner');
        const finish = svg.getElementById('finish');
        const start = svg.getElementById('start');
        this.outerPath = new Path2D(outer.getAttribute('d'));
        this.innerPath = new Path2D(inner.getAttribute('d'));
        this.finishLinePath = new Path2D(finish.getAttribute('d'));
        if (start) {
            this.startLineRect = {
                x: parseFloat(start.getAttribute('x')),
                y: parseFloat(start.getAttribute('y')),
                width: parseFloat(start.getAttribute('width')),
                height: parseFloat(start.getAttribute('height')),
            };
        }
    }

    render(ctx) {
        ctx.save();
        // draw grass background
        const [x,y,w,h] = this.viewBox;
        ctx.fillStyle = '#2d572c';
        ctx.fillRect(x, y, w, h);
        // draw asphalt
        ctx.fillStyle = '#666';
        ctx.fill(this.outerPath);
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fill(this.innerPath);
        ctx.restore();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 5;
        ctx.stroke(this.outerPath);
        ctx.stroke(this.innerPath);
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 4;
        ctx.stroke(this.finishLinePath);

        // draw checkered start line if available
        if (this.startLineRect) {
            const { x: sx, y: sy, width: sw, height: sh } = this.startLineRect;
            const square = sh / 10;
            for (let i = 0; i < 10; i++) {
                ctx.fillStyle = i % 2 === 0 ? '#000' : '#fff';
                ctx.fillRect(sx, sy + i * square, sw, square);
            }
        }
        ctx.restore();
    }

    isPointOnTrack(ctx, x, y) {
        const insideOuter = ctx.isPointInPath(this.outerPath, x, y);
        const insideInner = ctx.isPointInPath(this.innerPath, x, y);
        return insideOuter && !insideInner;
    }

    crossedFinish(prev, curr) {
        const minY = -5000; // large range
        const maxY = 5000;
        // finish line vertical at x=-100 for interlagos, 0 for oval.
        const lineX = this.name === 'interlagos' ? -200 : 0;
        if (this.name === 'oval') {
            return prev.x < 0 && curr.x >= 0 &&
                   curr.y <= -750 && curr.y >= -1000;
        }
        if (this.name === 'interlagos') {
            if ((prev.x < lineX && curr.x >= lineX) || (prev.x > lineX && curr.x <= lineX)) {
                if (curr.y <= -700 && curr.y >= -900) return true;
            }
        }
        return false;
    }
}

export default Track;
