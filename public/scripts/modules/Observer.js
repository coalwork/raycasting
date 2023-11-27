import Vector from './Vector.js';
import Ray from './Ray.js';
import { normalizeAngle } from './utils.js';

export default class Observer {
    #angle;
    #position;
    #visionRays;

    constructor(x, y, angle = 0, fov, options) {
        this.#position = new Vector(x, y);
        this.fov = fov;
        this.#visionRays = {
            left: new Ray(this.position, angle - fov / 2),
            right: new Ray(this.position, angle + fov / 2)
        };
        this.angle = angle;
    }

    move(v) {
        this.#position.overwrite(v);
        this.leftRay.v.overwrite(v);
        this.rightRay.v.overwrite(v);
    }

    moveRelative(v) {
        this.#position.add(v);
        this.leftRay.add(v);
        this.rightRay.add(v);
    }

    set angle(angle) {
        this.#angle = normalizeAngle(angle);
        this.leftRay.angle = this.#angle - this.fov / 2;
        this.rightRay.angle = this.#angle + this.fov / 2;
    }

    get angle() { return this.#angle; }

    get position() { return this.#position; }

    get leftRay() { return this.#visionRays.left; }
    get rightRay() { return this.#visionRays.right; }

    lookAt(v) {
        this.angle = Vector.subtract(v, this.position).angle;
    }
}
