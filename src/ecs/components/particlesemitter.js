import { Component } from "ape-ecs";
export class ParticlesEmitter extends Component {
  static properties = {
    particles:20
  }
}

export class Trail extends Component {
  static properties = {
    emitter: null,
    count_per_s: 40,
    particle_life: 1,
    particle_size: 4,
    max_count: 40,
    system_size: 20,
    particle_velocity: null
  }
}