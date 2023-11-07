import Vector from './modules/Vector.js';
import Observer from './modules/Observer.js';
import Ray from './modules/Ray.js';
import * as util from './modules/utils.js';
import LineSegment from './modules/LineSegment.js';

const width = 600;
const height = 600;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
canvas.id = 'main';

document.body.append(canvas);

const mouse = {
    x: NaN,
    y: NaN,
    get vector() { return new Vector(this.x, this.y); }
};

function getOffset() {
  const rect = canvas.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

document.addEventListener('mousemove', ({ clientX, clientY }) => {
    mouse.x = clientX - getOffset().left - width / 2;
    mouse.y = clientY - getOffset().top - height / 2;
});

const defaultFillStyle = '#181818';
const defaultStrokeStyle = '#ccc';
const ctx = canvas.getContext('2d');

let elapsedInitial = NaN;
let elapsedFinal = NaN;

let observer;

const walls = [];
const observerRays = [];
let segBounds;

config: {
    observer = new Observer(
        Math.random() * 50 - 25,
        Math.random() * 50 - 25,
        NaN,
        Math.PI / 2
    );

    observer.lookAt(new Vector(0, 0));

    ctx.lineWidth = 2;
    ctx.font = '10px sans-serif';

    walls: {
        const r = Math.random() * Math.PI * 2;
        const a = Vector.fromAngle(r + Math.PI / 6);
        const b = Vector.fromAngle(r + 5 * Math.PI / 6);
        const c = Vector.fromAngle(r + -Math.PI / 2);
        const temp = [[a, b], [a, c], [b, c]];
        temp.forEach(([v1, v2]) => {
            v1.magnitude = 200;
            v2.magnitude = 200;
            walls.push(new LineSegment(v1, v2));
        });
        walls.push(
            new LineSegment(
                new Vector(-200, 250),
                new Vector(200, 250)
            )
        );
    }

    segBounds = util.getLineSegmentsBounds(walls);
    for (let info of Object.entries(segBounds)) {
        observerRays.push([new Ray, ...info]);
    }
    console.log(observerRays);
}

function update() {
    observer.angle += Math.PI / 180;
}

function draw(ctx) {
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#fff';
    ctx.fillText(
        `\u0394t: ${elapsedFinal - elapsedInitial} ms`,
        5,
        parseInt(ctx.font) + 5
    );

    useDefaultFillStyle();
    useDefaultStrokeStyle();

    ctx.save();
    ctx.translate(width / 2, height / 2);

    walls: {
        ctx.beginPath();
        for (let { v1, v2 } of walls) {
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
        }
        ctx.stroke();
    }

    observer: {
        const { x, y } = observer.position;
        const lineVector = Vector.fromAngle(observer.angle);
        const radius = 10;

        lineVector.magnitude = radius;

        fov: {
            //break fov;

            const start = util.normalizeAngle(observer.angle - observer.fov / 2);
            const end = util.normalizeAngle(observer.angle + observer.fov / 2);

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + 1000 * Math.cos(start),
                y + 1000 * Math.sin(start)
            );
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + 1000 * Math.cos(end),
                y + 1000 * Math.sin(end)
            );
            ctx.moveTo(x, y);
            ctx.arc(x, y, 25, start, end);
            ctx.strokeStyle = '#f0f2';
            ctx.stroke();
            useDefaultStrokeStyle();
        }

        ctx.beginPath();
        ctx.arc(
            x, y,
            radius,
            0, observer.angle
        );
        ctx.moveTo(x, y);
        ctx.save();
        ctx.translate(x, y);
        ctx.lineTo(lineVector.x, lineVector.y);
        ctx.restore();
        ctx.stroke();

        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(
            x, y,
            radius,
            0, observer.angle,
            true
        );
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    mouse: {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    /*
    test: {}
    */

    ctx.restore();
}

setInterval(() => {
    elapsedFinal = performance.now();
    update();
    draw(ctx);
    elapsedInitial = performance.now();
}, 1000/45);

{ /* utils */ }

function useDefaultFillStyle() {
    ctx.fillStyle = defaultFillStyle;
}

function useDefaultStrokeStyle() {
    ctx.strokeStyle = defaultStrokeStyle;
}
