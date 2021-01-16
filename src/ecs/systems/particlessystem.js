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
                const three = e.getOne('ThreeComponent');

                if (trail == null) return;
                if (three == null) return;

                const p = this.createParticleEmitter(three, trail);

                trail.update();
                this.scene.add(p);
            }
        });

        // trail update
        this.trailQy.execute().forEach(e => {
            const trail = e.getOne('Trail');
            const component = e.getOne('ThreeComponent');

            if (trail == null) return;
            if (trail.emitter == null) return;
            if (component == null) return;

            const delta = loop.delta;
            const mesh = component.mesh;
            const attributes = trail.emitter.geometry.attributes;
            const count_per_s = trail.count_per_s;
            const recycle_indices = [];

            let i = 0;
            for (; i < trail.max_count; i++) {
                // update
                this.updateParticle(i, delta, trail, attributes);

                // get hidden particles
                if (attributes.hidden.array[i] == 1) {
                    recycle_indices.push(i);
                }
            }

            // create
            let creation_count = this.computeCreationCount(delta, count_per_s, recycle_indices.length);
            for (let r = 0; r < creation_count; r++) {
                i = recycle_indices[r];
                this.createParticle(i, trail, attributes, 0);
            }

            attributes.angle.needsUpdate = true;
            attributes.hidden.needsUpdate = true;
            attributes.position.needsUpdate = true;
            attributes.size.needsUpdate = true;
            trail.emitter.position.copy(mesh.position);
            trail.update();
        })

        this.destroyQy.execute().forEach(e => {
            const trail = e.getOne('Trail');
            const mesh = trail.emitter;
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.scene.remove(mesh);
            this.threeScene.renderer.renderLists.dispose();
        })
    }

    computeCreationCount(delta, count_per_s, recycle_indices_count) {
        let creation_count = count_per_s * delta;
        // if creation_count < 1 => probability to be created
        if (creation_count < 1) {
            if (Math.random() < creation_count)
                creation_count = 1;
            else
                creation_count = 0;
        }
        creation_count = Math.floor(creation_count);
        creation_count = Math.min(creation_count, recycle_indices_count);
        return creation_count;
    }

    createParticleEmitter(three, trail) {
        const mesh = three.mesh;
        const count = trail.max_count;
        const system_size = trail.system_size;
        const emitter = MeshFactory.createPoints({
            count,
            system_size,
            position: mesh.position,
            texture: CanvasFactory.createTexture({
                shape: 'tri'
            }),
            dynamic: true,
        });

        // prepare data
        const angle = new Float32Array(count);
        const hidden = new Float32Array(count);
        const size = new Float32Array(count);
        const age = new Float32Array(count);
        
        // set geometry attributes
        emitter.geometry.setAttribute('angle',
            new BufferAttribute(angle, 1));
        emitter.geometry.setAttribute('hidden',
            new BufferAttribute(hidden, 1));
        emitter.geometry.setAttribute('size',
            new BufferAttribute(size, 1));

        // setup trail object
        trail.emitter = emitter;
        trail.age = age;
        trail.count = count;

        // insert data in arrays
        const attributes = emitter.geometry.attributes;
        for (let i = 0; i < count; i++) {
            this.createParticle(i, trail, attributes);
        }
        return emitter;
    }

    createParticle(i, trail, attributes, hidden = 1) {
        trail.age[i] = 0;
        attributes.hidden.array[i] = hidden;
        attributes.angle.array[i] = Math.random() * Math.PI * 2;
        attributes.size.array[i] = trail.particle_size;

        let v3 = new Vector3()
            .random()
            .addScalar(-0.5)
            .setLength(trail.system_size);
        attributes.position.set(v3.toArray(), i * 3);
    }

    updateParticle(i, delta, trail, attributes) {
        trail.age[i] += delta;
        
        // hide
        const t = 1 - trail.age[i] / trail.particle_life;
        if (t < 0) {
            attributes.hidden.array[i] = 1;
            return;
        }

        // angle
        attributes.angle.array[i] += 0.03;

        // size
        attributes.size.array[i] = trail.particle_size * t;
        
        // position
        if(trail.particle_velocity != null) {
            attributes.position.array[i * 3 + 0] += trail.particle_velocity.x;
            attributes.position.array[i * 3 + 1] += trail.particle_velocity.y;
            attributes.position.array[i * 3 + 2] += trail.particle_velocity.z;
        }
    }

}