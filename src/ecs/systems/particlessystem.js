import { System } from "ape-ecs";
import { BufferAttribute, Color, Vector3 } from "three";
import CanvasFactory from "../../canvasfactory";
import MeshFactory from "../../meshfactory";
import Tween from "../../tween";

export default class ParticlesSystem extends System {
    init(threeScene) {
        this.threeScene = threeScene;
        this.scene = this.threeScene.scene;
        this.subscribe('Trail');
        this.subscribe('Destroy');

        this.trailQy = this.createQuery()
            .fromAll('ThreeComponent', 'Trail').persist();
    }

    update() {
        const loop = this.world.getEntity('game').getOne('GameLoop');

        this.changes.forEach(c => {
            if (c.op == 'add' && c.type == 'Trail') {
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
            else if (c.op == 'add' && c.type == 'Destroy') {
                const e = this.world.getEntity(c.entity);
                if (e == null) return;
                const component = e.getOne('Trail');
                if (component == null) return;
                const mesh = component.emitter;
                mesh.visible = false;
                // mesh.geometry.dispose();
                // mesh.material.dispose();
                // this.scene.remove(mesh);
                // this.threeScene.renderer.renderLists.dispose();    
            }
        });

        // trail update
        this.trailQy.execute().forEach(e => {
            const component = e.getOne('Trail');
            const three = e.getOne('ThreeComponent');

            if (component == null) return;
            if (component.emitter == null) return;
            if (three == null) return;

            const delta = loop.delta;
            const mesh = three.mesh;
            this.updateParticleEmitter(component, delta, mesh);
        })
    }

    updateParticleEmitter(component, delta, mesh) {
        const attributes = component.emitter.geometry.attributes;
        const count_per_s = component.count_per_s;
        const recycle_indices = [];

        let i = 0;
        for (; i < component.count; i++) {
            // update
            this.updateParticle(i, delta, component, attributes);

            // get hidden particles
            if (attributes.hidden.array[i] == 1) {
                recycle_indices.push(i);
            }
        }

        // create
        let creation_count = this.computeCreationCount(delta, count_per_s, recycle_indices.length);
        for (let r = 0; r < creation_count; r++) {
            i = recycle_indices[r];
            this.createParticle(i, component, mesh, attributes, 0);
        }

        attributes.angle.needsUpdate = true;
        attributes.hidden.needsUpdate = true;

        // TODO
        attributes.position.needsUpdate = true;
        attributes.velocity.needsUpdate = (component.decay > 0);

        attributes.size.needsUpdate = (component.use_size_tween == true);
        attributes.color.needsUpdate = (component.use_color_tween == true);

        if (component.behavior != 'trail')
            component.emitter.position.copy(mesh.position);
        component.update();
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
        const system_size = trail.system_size;
        const visibles = trail.initial_visibles;

        const count = trail.max_count || visibles + trail.count_per_s * trail.life;

        console.log(`max: ${trail.count}, count: ${count}`)

        trail.texture = CanvasFactory.createTexture({
            shape: trail.shape
        })

        const emitter = MeshFactory.createPoints({
            count,
            system_size,
            position: mesh.position,
            texture: trail.texture,
            dynamic: true,
        });

        // prepare data
        const angle = new Float32Array(count);
        const hidden = new Float32Array(count);
        const size = new Float32Array(count);
        const age = new Float32Array(count);
        const color = new Float32Array(count * 3);
        const velocity = new Float32Array(count * 3);

        // set geometry attributes
        emitter.geometry.setAttribute('angle',
            new BufferAttribute(angle, 1));
        emitter.geometry.setAttribute('hidden',
            new BufferAttribute(hidden, 1));
        emitter.geometry.setAttribute('size',
            new BufferAttribute(size, 1));
        emitter.geometry.setAttribute('color',
            new BufferAttribute(color, 3));
        emitter.geometry.setAttribute('velocity',
            new BufferAttribute(velocity, 3));

        // setup trail object
        trail.emitter = emitter;

        trail.age = age;
        trail.count = count;

        // convert color
        if (Number.isInteger(trail.color_start))
            trail.color_start = new Color(trail.color_start)
        if (Number.isInteger(trail.color_end))
            trail.color_end = new Color(trail.color_end)

        // tmp vars
        trail.v3 = new Vector3();

        // tweens
        if (trail.use_size_tween &&
            (trail.size_tween == null || trail.size_tween.length < count))
            trail.size_tween = new Array(count);
        if (trail.use_color_tween &&
            (trail.color_tween == null || trail.color_tween.length < count))
            trail.color_tween = new Array(count);


        // insert data in arrays
        const attributes = emitter.geometry.attributes;
        for (let i = 0; i < count; i++) {
            this.createParticle(i, trail, mesh, attributes, i >= visibles);
        }
        return emitter;
    }

    createParticle(i, trail, mesh, attributes, hidden = 1) {
        trail.age[i] = 0;
        attributes.hidden.array[i] = hidden;
        attributes.angle.array[i] = Math.random() * Math.PI * 2;
        attributes.size.array[i] = Math.random() * trail.size_start + trail.size_start;

        // position
        trail.v3 = trail.v3.random()
            .addScalar(-0.5)
            .setLength(trail.system_size);

        if (trail.behavior == 'trail') {
            trail.v3.add(mesh.position);
        }
        attributes.position.set(trail.v3.toArray(), i * 3);

        // velocity
        if (trail.behavior == 'explosion') {
            trail.v3.setLength(Math.random() * trail.velocity);
            attributes.velocity.set(trail.v3.toArray(), i * 3);
        }

        // color
        attributes.color.set(trail.color_start.toArray(), i * 3);

        // tweens
        if (trail.use_size_tween)
            trail.size_tween[i] = new Tween(attributes.size.array[i], trail.size_end);

        if (trail.use_color_tween)
            trail.color_tween[i] = new Tween(trail.color_start, trail.color_end);

    }

    updateParticle(i, delta, trail, attributes) {
        trail.age[i] += delta;
        const t = trail.age[i] / trail.life;

        // hide
        if (t > 1)
            attributes.hidden.array[i] = 1;

        // is hidden ? 
        if (attributes.hidden.array[i] == 1)
            return;

        // angle // TODO 
        attributes.angle.array[i] += .05;

        // size
        if (trail.use_size_tween == true)
            attributes.size.array[i] = trail.size_tween[i].update(t);

        // color
        if (trail.use_color_tween == true) {
            trail.size_tween[i].update(t);
            attributes.color.array[i * 3 + 0] = trail.color_tween[i].color.r;
            attributes.color.array[i * 3 + 1] = trail.color_tween[i].color.g;
            attributes.color.array[i * 3 + 2] = trail.color_tween[i].color.b;
        }

        // position
        // TODO fix when trail
        if (attributes.velocity != null) {
            attributes.position.array[i * 3 + 0] +=
                attributes.velocity.array[i * 3 + 0] * delta;

            attributes.position.array[i * 3 + 1] +=
                attributes.velocity.array[i * 3 + 1] * delta;

            attributes.position.array[i * 3 + 2] +=
                attributes.velocity.array[i * 3 + 2] * delta;
        }

        // velocities
        if (trail.decay) {
            attributes.velocity.array[i * 3 + 0] *= trail.decay;
            attributes.velocity.array[i * 3 + 0] *= 0.9;

            attributes.velocity.array[i * 3 + 1] *= trail.decay;

            attributes.velocity.array[i * 3 + 2] *= trail.decay;
            attributes.velocity.array[i * 3 + 2] *= 0.9;
        }
    }

}