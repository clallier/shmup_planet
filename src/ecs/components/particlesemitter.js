import { Component } from "ape-ecs";
import { Color, Vector3 } from "three";
export class ParticlesEmitter extends Component {
  static properties = {
    particles:20
  }
}

export class Trail extends Component {
  static properties = {
    emitter: null,
    // emitter props
    max_count: 0,
    system_size: 20,
    count_per_s: 40,

    // particle props
    life: 1, // in s
    size_tween: false,
    size_start: 1,
    size_end: 0,
    velocity: null,
    color_tween: false,
    color_start: new Vector3(1, 0, 0),
    color_end: new Vector3(0, 0, 1),
    // TODO : better name
    // angle animation
    // initial velocity
    // initial visibles
    // TODO use binary values for needsUpdate
  }
}