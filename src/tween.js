import { Color } from "three";

export default class Tween {
    constructor(start, end) {
        this.start = start;
        this.end = end;

        if(start instanceof Color) {
            this.f = (t) => this.vector3Lerp(t);
            this.color = this.start.clone();
        }
        else this.f = (t) => this.lerp(t);
    }

    update (t) {
        return this.f(t);
    }

    vector3Lerp (t) {
        this.color.r = Tween.lerp(this.start.r, this.end.r, t);
        this.color.g = Tween.lerp(this.start.g, this.end.g, t);
        this.color.b = Tween.lerp(this.start.b, this.end.b, t);
        return this.color;
    }

    lerp (t) {
        return Tween.lerp(this.start, this.end, t);
    }

    static lerp(start, end, t) {
        return start + t * (end - start);
    }
}