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

let observer;

const walls = [];
const rayBoundMap = new Map;
const rayIntersectionMap = new Map;
const observerRotationalVelocity = 1 * Math.PI;
const fovBorderlyVisible = {
    left: null,
    right: null
};
let wallsBoundsMap;
let pastMouseVector = new Vector(NaN, NaN);

config: {
    observer = new Observer(
        Math.random() * 50 - 25,
        Math.random() * 50 - 25,
        NaN,
        Math.PI / 2
    );

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

    wallsBoundsMap = util.getLineSegmentsBounds(walls);

    for (let bound of wallsBoundsMap.keys()) {
        rayBoundMap.set(new Ray(observer.position, NaN), bound);
    }
}

function update(deltaTime) {
    const dSec = Number.isNaN(deltaTime) ? 0 : deltaTime / 1000;
    //observer.angle += 1/4 * dSec * observerRotationalVelocity;
    if (Number.isNaN(observer.angle))
        observer.lookAt(new Vector(0, 0));

    observer.angle += (mouse.vector.x - (pastMouseVector?.x ?? 0)) * Math.PI / 180;
    pastMouseVector = mouse.vector.copy();

    let distLeft = Infinity;
    let distRight = Infinity;

    for (let wall of walls) {
        const leftInter = util.intersectRS(observer.leftRay, wall);
        const rightInter = util.intersectRS(observer.rightRay, wall);

        left: {
            if (!leftInter) break left;
            if (leftInter.dist(observer.position) < distLeft)
                fovBorderlyVisible.left = wall;
        }

        right: {
            if (!rightInter) break right;
            if (rightInter.dist(observer.position) < distRight)
                fovBorderlyVisible.right = wall;
        }
    }

    for (let [ray, bound] of rayBoundMap.entries()) {
        ray.angle = Vector.subtract(bound, ray.v).angle;
    }
}

function draw(ctx, deltaTime) {
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#fff';
    ctx.fillText(
        `\u0394t: ${Math.round(deltaTime * 100) / 100} ms`,
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

    
    test: {
        rays: {
            const { x, y } = observer.position;
            for (let [ray, bound] of rayBoundMap) {
                const { v, angle: a } = ray;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + 1000 * Math.cos(a),
                    y + 1000 * Math.sin(a)
                );
                ctx.strokeStyle = `#${util.inView(bound, observer) ? '0ff' : 'ff0'}2`;
                ctx.stroke();
            }
            useDefaultStrokeStyle();
        }

        fovRays: {
            const { leftRay, rightRay } = observer;

            ctx.beginPath();
            for (let wall of walls) {
                for (let ray of [leftRay, rightRay]) {
                    const { v, angle: a } = ray;
                    const { v2 } = ray.toSegment();
                    const inter = util.intersectRS(ray, wall);

                    if (!inter) continue;
                    const { x, y } = inter;
                    ctx.moveTo(x, y);
                    ctx.arc(x, y, 10, 0, Math.PI * 2);
                }
            }
            ctx.strokeStyle = '#fff2';
            ctx.stroke();
            useDefaultFillStyle();
        }
    }

    ctx.restore();
}

let previous;
let isDone = false;

function step(start) {
    const deltaTime = start - previous ?? 0;

    // while (performance.now() > 2000 && !isDone) {
    //     for (let i = 0; i < 1e4; i++) { console.log(1); }
    //     isDone = true;
    // }

    // deltaTime
    // console.log(`\u0394t: ${deltaTime}`);
    update(deltaTime);
    draw(ctx, deltaTime);

    previous = start;
    frameCount = requestAnimationFrame(step);
}

let frameCount = requestAnimationFrame(step);

{ /* utils */ }

function useDefaultFillStyle() {
    ctx.fillStyle = defaultFillStyle;
}

function useDefaultStrokeStyle() {
    ctx.strokeStyle = defaultStrokeStyle;
}
