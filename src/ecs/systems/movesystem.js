import { System } from "ape-ecs";

export default class MoveSystem extends System {
    init() {
        this.moveAlongRingQy = this.createQuery()
            .fromAll('MoveAlongRing', 'ThreeComponent').persist();

        this.moveQy = this.createQuery()
            .fromAll('Move', 'ThreeComponent').persist();
    }

    update() {
        const loop = this.world.getEntity('game').getOne('GameLoop');

        this.moveAlongRingQy.execute().forEach(e => {
            const move = e.getOne('MoveAlongRing');
            const component = e.getOne('ThreeComponent');
            if (move == null) return;
            if (component == null) return;
            const mesh = component.mesh;

            // max velocity
            if (move.velocity > move.max_velocity) {
                move.velocity = move.max_velocity;
            }
            if (move.velocity < -move.max_velocity) {
                move.velocity = -move.max_velocity;
            }

            // if(e.id == 'player') {
            //     console.log(`${e.id}: ${move.velocity.toFixed(2)} / ${move.max_velocity}, ↗:${(move.force * loop.delta).toFixed(2)} ↘:${move.decay}`);
            // }

            // add velocity to angle
            move.angle += (move.velocity * loop.delta);

            if (move.angle > move.max_angle)
                move.angle -= move.max_angle;
            if (move.angle < move.min_angle)
                move.angle += move.max_angle;

            // decay
            move.velocity *= move.decay;

            mesh.position.x = Math.cos(move.angle) * move.radius;
            mesh.position.z = Math.sin(move.angle) * move.radius;
            mesh.position.y = 2 + Math.sin(loop.time) * 2;
            mesh.lookAt(0, 0, 0);

            move.update();
        });

        this.moveQy.execute().forEach(e => {
            const move = e.getOne('Move');
            const component = e.getOne('ThreeComponent');
            if (move == null) return;
            if (component == null) return;

            const mesh = component.mesh;
            move.velocity.y += move.gravity;
            const vel = move.velocity.clone().multiplyScalar(loop.delta)

            // add velocity to position
            mesh.position.add(vel);
            mesh.rotateZ(move.tilt_angle);

            move.update();
        });
    }
}