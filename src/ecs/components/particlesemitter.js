import { Component } from "ape-ecs";
import { MathUtils } from "three";

export class ParticlesEmitter extends Component {
  static properties = {
    particles:20
  }
}

export class Trail extends Component {
  static properties = {
      particles: null,
      n_per_s: 30,
      particle_life: 0.3,
      max_count: 200
  }
}