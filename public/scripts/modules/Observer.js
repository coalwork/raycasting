import Vector from './Vector.js';
import { normalizeAngle } from './utils.js';

export default class Observer {
    #angle;

    constructor(x, y, angle = 0, fov, options) {
        this.position = new Vector(x, y);
        this.angle = angle;
        this.fov = fov;
    }

    set angle(angle) {
        this.#angle = normalizeAngle(angle);
    }

    get angle() { return this.#angle; }

    lookAt(v) {
        this.#angle = Vector.subtract(v, this.position).angle;
    }
}
