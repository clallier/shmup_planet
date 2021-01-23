import { Component } from "ape-ecs";
import { Vector3 } from "three";
import Palette from "../../palette";

// TODO remove ParticlesEmitter
export class ParticlesEmitter extends Component {
  static properties = {
    particles: 20
  }
}

// TODO rename Trail
export class Trail extends Component {
  static properties = {
    behavior: '',
    emitter: null,

    // emitter props
    shape: 'dot',
    max_count: 0,
    system_size: 20,
    count_per_s: 40,
    initial_visibles: 0,
    decay: 0,

    // particle props
    life: 1, // in s
    size_tween: true,
    size_start: 1,
    size_end: 0,
    velocity: null,
    color_tween: true,
    color_start: new Vector3(1, 0, 0),
    color_end: new Vector3(0, 0, 1),

    // TODO : better name
    // angle animation
    // initial velocity
    // initial visibles
    // TODO use binary values for needsUpdate
    // TODO decay (velocity)
  }
}

export class EmitterFactory {
  static createTrail(velocity) {
    return {
      type: 'Trail',
      behavior: 'trail',

      shape: 'rect',
      system_size: 4,
      count_per_s: 40,

      life: 0.8,
      velocity: velocity,
      size_start: 3,
      size_end: 0,
      color_start: Palette.light,
      color_end: Palette.dark_red
    }
  }

  static createExplosion() {
    return {
      type: 'Trail',
      behavior: 'explosion',

      shape: 'tri',
      system_size: 5,
      count_per_s: 0,
      initial_visibles: 400,
      decay: 0.96,

      life: 1.2,
      size_start: 7,
      size_end: 0,
      color_start: Palette.red,
      color_end: Palette.light
    }
  }
}