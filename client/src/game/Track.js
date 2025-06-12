class Track {
    constructor(name) {
        this.name = name;
        this.outerPath = null;
        this.innerPath = null;
        this.finishLinePath = null;
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
        this.outerPath = new Path2D(outer.getAttribute('d'));
        this.innerPath = new Path2D(inner.getAttribute('d'));
        this.finishLinePath = new Path2D(finish.getAttribute('d'));
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
        const lineX = -100;
        if (this.name === 'oval') {
            return prev.x < 0 && curr.x >= 0 &&
                   curr.y <= -150 && curr.y >= -200;
        }
        if (this.name === 'interlagos') {
            if ((prev.x < lineX && curr.x >= lineX) || (prev.x > lineX && curr.x <= lineX)) {
                if (curr.y <= -350 && curr.y >= -450) return true;
            }
        }
        return false;
    }
}

export default Track;
