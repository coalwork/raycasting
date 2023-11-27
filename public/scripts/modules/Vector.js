export default class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    get angle() {
        return Math.atan2(this.y, this.x);
    }

    set magnitude(magnitude) {
        const mag = this.magnitude;
        this.x *= magnitude / mag;
        this.y *= magnitude / mag;
        return magnitude;
    }

    set angle(angle) {
        const mag = this.magnitude;
        this.x = Math.cos(angle) * mag;
        this.y = Math.sin(angle) * mag;
        return angle;
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    normalized() {
        const { angle } = this;
        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    static equal(v1, v2) {
        return v1.x === v2.x && v1.y === v2.y;
    }

    static fromAngle(angle) {
        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
    }

    get negative() {
        return new Vector(-this.x, -this.y);
    }

    subtract(v) {
        this.add(v.negative);
    }

    static subtract(v1, v2) {
        return Vector.add(v1, v2.negative);
    }

    static dist(v1, v2) {
        return Math.hypot(v1.x - v1.y, v2.x - v2.y);
    }

    dist(v) { return Vector.dist(this, v); }

    overwrite({ x, y }) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `${this.x},${this.y}`;
    }
}
