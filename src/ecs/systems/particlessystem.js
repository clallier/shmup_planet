import { System } from "ape-ecs";
import { Vector3 } from "three";
import EntityFactory from '../entityfactory';

export default class ParticlesSystem extends System {
    init() {
        this.subscribe('ParticlesEmitter');
    }

    update() {
        this.changes.forEach(c => {
            if (c.op == 'add') {
                const entity = this.world.getEntity(c.entity);
                const emitter = this.world.getComponent(c.component);
                const three = entity.getOne('ThreeComponent');

                // no position, so ... no position to start emit
                if (three == null) return;

                // here come particles ...
                const mesh = three.mesh;
                for (let i = 0; i < emitter.particles; i++) {
                    const tilt = Math.random() * 0.1;
                    const decay = Math.random() * 0.1 + 0.9; 
                    const ttl = Math.random() + 1.5; 
                    // angle on ground plane
                    const velocity = 3.5;
                    const xz_angle = Math.random() * 2 * Math.PI;
                    // start position 
                    const position = mesh.position;
                    // direction
                    const direction = new Vector3(
                        Math.cos(xz_angle) * velocity,
                        velocity,
                        Math.sin(xz_angle) * velocity
                    )
                    // creation
                    EntityFactory.createParticle({
                        position,
                        direction,
                        decay,
                        tilt,
                        ttl
                    })
                }
            }
        });
    }
}