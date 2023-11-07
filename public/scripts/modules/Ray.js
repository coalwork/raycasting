import { normalizeAngle } from './utils.js';
import Vector from './Vector.js';
import LineSegment from './LineSegment.js';

export default class Ray {
    #angle;

    constructor(origin, angle = NaN) {
        this.v = origin;
        this.angle = angle;
    }

    has(p) {
        const { v, angle } = this;
        return Vector.equals(v, p)
            || Vector.subtract(p, v).angle === angle;
    }

    toSegment(mag = 1e6) {
        const { v, angle } = this;
        const relative = Vector.fromAngle(angle);
        relative.magnitude = mag;

        return new LineSegment(v, Vector.add(v, relative));
    }

    get angle() { return this.#angle; }

    set angle(angle) {
        this.#angle = normalizeAngle(angle);
    }
}
