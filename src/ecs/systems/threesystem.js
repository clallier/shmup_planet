import { System } from "ape-ecs";
import { Vector3 } from "three";
import Tween from "../../tween";

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

        this.tweenColorQy = this.createQuery()
            .fromAll('ThreeComponent', 'TweenColor').persist();
    }

    update() {
        const loop = this.world.getEntity('game').getOne('GameLoop');

        this.changes.forEach(c => {
            if (c.op == 'add' && c.type == 'ThreeComponent') {
                const component = this.world.getComponent(c.component);
                const mesh = component.mesh;
                mesh.name = component.id;
                if (component.position != null)
                    mesh.position.copy(component.position);
                if (component.rotation != null)
                    mesh.lookAt(component.rotation);
                this.scene.add(mesh);
            }

            else if (c.op == 'add' && c.type == 'Destroy') {
                const e = this.world.getEntity(c.entity);
                if (e == null) return;
                const component = e.getOne('ThreeComponent');
                if (component == null) return;
                // console.log(`removed mesh from ${c.entity}`);
                const mesh = component.mesh;
                mesh.visible = false;
                // mesh.geometry.dispose();
                // mesh.material.dispose();
                // this.scene.remove(mesh);
                // this.threeScene.renderer.renderLists.dispose();
            }
        });

        this.updateShaderQy.execute().forEach(e => {
            const component = e.getOne('ThreeComponent');
            if (component == null) return;
            component.mesh.material.uniforms['time'].value = loop.time;
        });

        this.tweenColorQy.execute().forEach(e => {
            const component = e.getOne('TweenColor');
            const three = e.getOne('ThreeComponent');

            if (component == null) return;
            if (three == null) return;

            if (component.tween == null)
                component.tween = new Tween(component.start, component.end);

            const tween = component.tween;
            const t = component.time / component.duration;
            const mesh = three.mesh;
            mesh.material.color.copy(tween.update(t));

            component.time += loop.delta;
            component.update();
        })

        // should be the "before-last" update of threesystem 
        // (cause of updateProjectionMatrix) 
        this.cameraTargetQy.execute().forEach(e => {
            const move = e.getOne('MoveAlongRing');
            if (move == null) return;

            // 50 < fov < 100 - threescene.resize()
            let fov = this.threeScene.fov;
            // velocity (max: 0.3)
            const vel = move.velocity * loop.delta;
            // velocity * velocity (max: 324)
            const v = (300 * vel) ** 2;
            // camera "dist" (~20)
            const d = 120 - fov;
            // camera height (~20)
            const h = Math.min(v + (10 + .5 * d), 80);
            // camera radius
            const r = move.radius + d;
            // camera angle
            const futur_angle = move.angle + vel;
            // fov
            fov = Math.min(fov + 4 * v, fov + 20);
            //console.log(`v:${v.toFixed(1)} d:${d.toFixed(1)}, h:${h.toFixed(1)}, r:${r.toFixed(1)}, a:${futur_angle.toFixed(1)}, fov:${fov}`);

            this.target.y = h /*+ Math.sin(loop.time) * 1.7*/;
            this.target.x = Math.cos(futur_angle) * r;
            this.target.z = Math.sin(futur_angle) * r;
            this.camera.position.lerp(this.target, 0.8);
            this.camera.lookAt(0, 0, 0);

            this.camera.fov = Tween.lerp(this.camera.fov, fov, .8);
            // console.log(`fov:${this.camera.fov.toFixed(1)}`);
            this.camera.updateProjectionMatrix();
        })

        // should be the last update of threesystem 
        // (cause change camera position) 
        this.screenShakeQy.execute().forEach(e => {
            const screenShake = e.getOne('ScreenShake');
            const component = e.getOne('ThreeComponent');

            if (screenShake == null) return;
            if (component == null) return;

            const p = screenShake.power;
            this.camera.position.x += Math.random() * p - p / 2;
            this.camera.position.y += Math.random() * p - p / 2;
            this.camera.position.z += Math.random() * p - p / 2;
        })
    }
}