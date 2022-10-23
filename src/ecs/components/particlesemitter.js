import { Component } from "ape-ecs";
import { Vector3 } from "three";
import Palette from "../../palette";

// TODO rename Trail
export class Trail extends Component {
  static properties = {
    behavior: '',

    // emitter props
    shape: 'dot',
    max_count: 0,
    system_size: 20,
    count_per_s: 40,
    initial_visibles: 0,
    decay: 0,

    // particle props
    life: 1, // in s
    use_size_tween: true,
    size_start: 1,
    size_end: 0,
    velocity: null,
    use_color_tween: true,
    color_start: new Vector3(1, 0, 0),
    color_end: new Vector3(0, 0, 1),

    // TODO angle animation
    // TODO opacity + animation
    // TODO add spread (random inital values constrol)  
  }
}

export class EmitterFactory {
  static createTrail(size = 4) {
    return {
      type: 'Trail',
      behavior: 'trail',

      shape: 'rect',
      system_size: size,
      count_per_s: 40,

      life: 0.8,
      size_start: 1,
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
      system_size: 6,
      count_per_s: 0,
      initial_visibles: 120,
      decay: 0.96,

      life: 1.2,
      size_start: 6,
      size_end: 0,
      velocity: 400,
      color_start: Palette.red,
      color_end: Palette.light
    }
  }
}