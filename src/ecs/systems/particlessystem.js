import { System } from "ape-ecs";
import { BufferAttribute, Vector3 } from "three";
import EntityFactory from '../entityfactory';
import CanvasFactory from "../../canvasfactory";
import MeshFactory from "../../meshfactory";

export default class ParticlesSystem extends System {
    init(threeScene) {
        this.threeScene = threeScene;
        this.scene = this.threeScene.scene;
        this.subscribe('ParticlesEmitter');
        this.subscribe('Trail');

        this.trailQy = this.createQuery()
            .fromAll('ThreeComponent', 'Trail').persist();

        this.destroyQy = this.createQuery()
            .fromAll('Trail', 'Destroy').persist();
    }

    update() {
        const loop = this.world.getEntity('game').getOne('GameLoop');

        this.changes.forEach(c => {
            if (c.op == 'add' && c.type == 'ParticlesEmitter') {
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
            else if (c.op == 'add' && c.type == 'Trail') {
                const e = this.world.getEntity(c.entity);
                if (e == null) return;
                const trail = this.world.getComponent(c.component);
                const component = e.getOne('ThreeComponent');

                if (trail == null) return;
                if (component == null) return;

                const mesh = component.mesh;
                const count = trail.max_count;
                const p = MeshFactory.createPoints({
                    count,
                    system_size: 20,
                    point_size: 24,
                    texture: CanvasFactory.createTexture({
                        shape: 'tri'
                    }),
                    dynamic: true,
                });

                // prepare data
                const angle = new Float32Array(count);
                const age = new Float32Array(count);
                const hidden = new Float32Array(count);

                // insert data in arrays
                for (let i = 0; i < count; i++) {
                    angle[i] = Math.random() * Math.PI * 2;
                    age[i] = 0;
                    hidden[i] = 1; // hidden by default
                }

                // set attributes
                p.geometry.setAttribute('angle',
                    new BufferAttribute(angle, 1));
                p.geometry.setAttribute('hidden',
                    new BufferAttribute(hidden, 1));

                // setup trail object
                trail.particles = p;
                trail.age = age;
                trail.count = count;
                trail.update();

                this.scene.add(p);
            }
        });

        // trail update
        this.trailQy.execute().forEach(e => {
            const trail = e.getOne('Trail');
            const component = e.getOne('ThreeComponent');

            if (trail == null) return;
            if (trail.particles == null) return;
            if (component == null) return;

            const mesh = component.mesh;
            const attributes = trail.particles.geometry.attributes;
            const recycle_indices = [];

            let i = 0;
            for (; i < trail.max_count; i++) {
                // update
                trail.age[i] += loop.delta;
                attributes.angle.array[i] += 0.03;

                // hide
                if (trail.age[i] > trail.particle_life) {
                    attributes.hidden.array[i] = 1;
                }

                // get hidden particles
                if (attributes.hidden.array[i] == 1) {
                    recycle_indices.push(i);
                }
            }

            // create
            let n_creation = trail.n_per_s * loop.delta;
            if (n_creation < 1) {
                if (Math.random() < n_creation) n_creation = 1;
                else n_creation = 0;
            }
            n_creation = Math.floor(n_creation);

            n_creation = Math.min(n_creation, recycle_indices.length);
            for (let r = 0; r < n_creation; r++) {
                i = recycle_indices[r];
                // set age +visibility + position
                trail.age[i] = 0;
                attributes.hidden.array[i] = 0;
                attributes.position.array[i * 3 + 0] = mesh.position.x;
                attributes.position.array[i * 3 + 1] = mesh.position.y;
                attributes.position.array[i * 3 + 2] = mesh.position.z;
            }

            attributes.angle.needsUpdate = true;
            attributes.hidden.needsUpdate = true;
            attributes.position.needsUpdate = true;
            trail.update();
        })

        this.destroyQy.execute().forEach(e => {
            const trail = e.getOne('Trail');
            const mesh = trail.particles;
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.scene.remove(mesh);
            this.threeScene.renderer.renderLists.dispose();
        })
    }
}