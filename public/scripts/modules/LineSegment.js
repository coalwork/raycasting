import { boxBound } from './utils.js';

export default class LineSegment {
    constructor(v1, v2) {
        this.v1 = v1;
        this.v2 = v2;
    }

    get slope() {
        const { x: a, y: b } = this.v1;
        const { x: c, y: d } = this.v2;
        return (b - d) / (a - c);
    }

    has(p) {
        const { slope: m, v1, v2 } = this;
        const { x, y } = v1;
        const { x: a, y: b } = p;
        let equation = y - b === m * (x - a);
        if (!Number.isFinite(slope)) equation = x === a;
        return equation && boxBound(v1, v2, p);
    }

    static fromNums(a, b, c, d) {
        return new LineSegment(new Vector(a, b), new Vector(c, d));
    }
}
