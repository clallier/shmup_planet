import { System } from "ape-ecs";
import { Vector3 } from "three";
import { MeshFactory, Palette } from "../../meshfactory";

export default class ThreeSystem extends System {
    init(threeScene) {
        this.threeScene = threeScene;
        this.scene = this.threeScene.scene;
        this.camera = this.threeScene.camera;
        this.target = new Vector3();

        this.subscribe('ThreeComponent');
        this.subscribe('Destroy');

        this.updateShaderQy = this.createQuery()
            .fromAll('ThreeComponent', 'UpdateShader');

        this.cameraTargetQy = this.createQuery()
            .fromAll('MoveAlongRing', 'CameraTarget');
            
        this.screenShakeQy = this.createQuery()
            .fromAll('ThreeComponent', 'ScreenShake').persist();

        this.targetColorQy = this.createQuery()
            .fromAll('ThreeComponent', 'TargetColor').persist();

        this.trailQy = this.createQuery()
            .fromAll('ThreeComponent', 'Trail').persist();
    }

    update() {
        const loop = this.world.getEntity('game').getOne('GameLoop');

        this.changes.forEach(c => {
            if(c.op == 'add' && c.type == 'ThreeComponent') {
                const component = this.world.getComponent(c.component);
                const mesh = component.mesh;
                mesh.name = component.id;
                if(component.position != null)
                    mesh.position.copy(component.position);
                if(component.rotation != null)
                    mesh.lookAt(component.rotation);
                this.scene.add(mesh);
            }
            else if (c.op == 'add' && c.type == 'Destroy') {
                const e = this.world.getEntity(c.entity);
                if(e == null) return;
                const component = e.getOne('ThreeComponent');
                if(component == null) return;
                // console.log(`removed mesh from ${c.entity}`);
                const mesh = component.mesh;
                mesh.geometry.dispose();
                mesh.material.dispose();
                this.scene.remove(mesh);
                this.threeScene.renderer.renderLists.dispose();
            } 
        });

        this.updateShaderQy.execute().forEach(e => {
            const component = e.getOne('ThreeComponent');
            if(component == null) return;
            component.mesh.material.uniforms['time'].value = loop.time;
        });

        this.cameraTargetQy.execute().forEach(e => {
            const move = e.getOne('MoveAlongRing');
            if(move == null) return;

            const h = Math.abs(move.speed) * 60;
            const r = move.radius + 20 + Math.abs(move.speed) * 50;
            const futur_angle = move.angle + move.speed * 4;
            // console.log(h);
            this.camera.fov = 100 + 2*h*h;
            this.target.y = 15 + h;
            this.target.x = Math.cos(futur_angle) * r;
            this.target.z = Math.sin(futur_angle) * r;
            this.camera.position.lerp(this.target, 0.3);
            this.camera.updateProjectionMatrix();
        })

        this.screenShakeQy.execute().forEach(e => {
            const screenShake = e.getOne('ScreenShake');
            const component = e.getOne('ThreeComponent');

            if(screenShake == null) return;
            if(component == null) return;

            const p = screenShake.power;
            this.camera.position.x += Math.random() * p - p/2;
            this.camera.position.y += Math.random() * p - p/2;
            this.camera.position.z += Math.random() * p - p/2;
        })

        this.targetColorQy.execute().forEach(e => {
            const target = e.getOne('TargetColor');
            const component = e.getOne('ThreeComponent');

            if(target == null) return;
            if(component == null) return;

            const t = target.time / target.duration;
            const mesh = component.mesh;
            mesh.material.color.lerp(target.color, t);

            target.time += loop.delta;
            target.update();
        })

        this.trailQy.execute().forEach(e => {
            const trail = e.getOne('Trail');
            const component = e.getOne('ThreeComponent');

            if(trail == null) return;
            if(component == null) return;

            const mesh = component.mesh;
            if(trail.emitter == null) {
                // create trail particles
                const p = MeshFactory.createPoints({
                    position: mesh.position,
                    count: trail.max_particles,
                    system_size: 20
                });

                this.scene.add(p);
                trail.emitter = p;
            }

            if(trail.duration <= 0) {
                // TODO 
            }

            // update durations
            trail.duration -= loop.delta;
            trail.update();
        })
      }
}