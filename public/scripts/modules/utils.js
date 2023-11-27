import Vector from './Vector.js';

export function normalizeAngle(angle) {
    let temp = angle;
    temp %= (Math.PI * 2);
    if (temp < 0) temp += Math.PI * 2;
    if (temp > Math.PI) temp -= Math.PI * 2;
    return temp;
}

export function lineBound(x1, x2, p) {
    const $ = round4Decimals;
    const $x1 = $(x1);
    const $x2 = $(x2);
    const $p = $(p);
    if ($x1 > $x2) return $x2 < $p && $p <= $x1;
    return $x1 <= $p && $p <= $x2;
}

export function boxBound(v1, v2, { x, y }) {
    const $ = lineBound;
    return $(v1.x, v2.x, x) && $(v1.y, v2.y, y);
}

export function intersectSS(
    { v1: a, v2: b }, { v1: c, v2: d }
) {
    const m1 = (a.y - b.y) / (a.x - b.x);
    const m2 = (c.y - d.y) / (c.x - d.x);

    if (m1 === m2
        || !(Number.isFinite(m1) || Number.isFinite(m2)))
        return null;

    let x;
    let y;

    x = (m1 * a.x - m2 * c.x + c.y - a.y) / (m1 - m2);
    y = m1 * (x - a.x) + a.y;
    if (!Number.isFinite(m1)) {
        x = a.x;
        y = m2 * (x - c.x) + c.y;
    } else if (!Number.isFinite(m2)) {
        x = c.x;
    }

    const p = new Vector(x, y);

    if (!(boxBound(a, b, p) && boxBound(c, d, p)))
        return null;

    return p;
}

export function intersectRS(
    ray, { v1: c, v2: d }
) {
    const { v, angle } = ray;
    const m1 = Math.tan(angle);
    const m2 = (c.y - d.y) / (c.x - d.x);

    if (m1 === m2
        || !(Number.isFinite(m1) || Number.isFinite(m2)))
        return null;

    let x;
    let y;

    x = (m1 * v.x - m2 * c.x + c.y - v.y) / (m1 - m2);
    y = m1 * (x - v.x) + v.y;
    if (!Number.isFinite(m1)) {
        x = v.x;
        y = m2 * (x - c.x) + c.y;
    } else if (!Number.isFinite(m2)) {
        x = c.x;
    }

    const p = new Vector(x, y);
    const { v1, v2 } = ray.toSegment();
    if (!(boxBound(v1, v2, p) && boxBound(c, d, p)))
        return null;

    return p;
}

export const getLineSegmentsBounds = (() => {
    const addSegment = (segment, bound, bsm) => {
        if (!Array.isArray(bsm.get(bound)))
            bsm.set(bound, []);

        let segList = bsm.get(bound);

        segList.push(segment);
    };

    return function(segments) {
        const boundSegmentMap = new Map;

        for (let segment of segments) {
            const { v1, v2 } = segment;

            addSegment(segment, v1, boundSegmentMap);
            addSegment(segment, v2, boundSegmentMap);
        }

        return boundSegmentMap;
    };
})();

export function isBetweenAngle(a, b, angle) {
    return lineBound(a, b, angle);
}

export function inView(bound, observer) {
    if (bound === undefined) return false;
    const { angle: a, fov: f, position: p } = observer;
    const relativeAngle = Vector.subtract(bound, p).angle;
    const coterminal = Math.PI * 2;

    let [j, k, l] = [a - f / 2, a + f / 2, relativeAngle];

    if (a < 0 && j <= -Math.PI && l > 0) {
        l -= coterminal;
    } else if (a > 0 && k > Math.PI && l < 0) {
        l += coterminal;
    }

    return isBetweenAngle(j, k, l);
}

export function round4Decimals(a) {
    return Math.round(a * 1e4) / 1e4;
}
