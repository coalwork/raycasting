import Vector from './Vector.js';

export function normalizeAngle(angle) {
    let temp = angle;
    temp %= (Math.PI * 2);
    if (temp < 0) temp += Math.PI * 2;
    if (temp > Math.PI) temp -= Math.PI * 2;
    return temp;
}

export function lineBound(x1, x2, p) {
    if (x1 > x2) return x2 <= p && p <= x1;
    return x1 <= p && p <= x2;
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

export const getLineSegmentsBounds = (() => {
    const addSegment = (segment, bound, bsm) => {
        if (!Array.isArray(bsm[bound]))
            bsm[bound] = [];

        let segList = bsm[bound];

        segList.push(segment);
    };

    return function(segments) {
        const boundSegmentMap = {};

        for (let segment of segments) {
            const { v1, v2 } = segment;

            addSegment(segment, v1, boundSegmentMap);
            addSegment(segment, v2, boundSegmentMap);
        }

        return boundSegmentMap;
    };
})();

export function isBetweenAngle(a, b, angle) {
    const coterminal = Math.PI * 2;
    const n = normalizeAngle(angle);
    return lineBound(
        a,
        b + coterminal * (b < a),
        n + coterminal * (b < a && n < b)
    );
}
