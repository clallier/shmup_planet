import { Component } from "ape-ecs";
import { Vector3 } from "three";

export class Move extends Component {
    static properties = {
        velocity: new Vector3(),
        decay: 1,
        gravity: 0,
        tilt_angle: 0
    }
}

export class MoveAlongRing extends Component {
    // Do not change values here, change in entitie definitions instead
    static properties = {
        radius: 100,
        angle: 0,
        min_angle: 0,
        max_angle: 2 * Math.PI,
        force: 5,
        max_velocity: 1,
        decay: 0,
        velocity: 0
    }
}