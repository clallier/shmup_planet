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
            if(move == null) return;
            if(component == null) return;
            const mesh = component.mesh;

            move.speed *= move.decay;
            if (move.speed > 0.1) move.speed == 0.1;
            if (move.speed < -0.1) move.speed == -0.1;
            move.angle += move.speed;
    
            if (move.angle > move.max_angle)
                move.angle -= move.max_angle;
            if (move.angle < move.min_angle)
                move.angle += move.max_angle;
    
            mesh.position.x = Math.cos(move.angle) * move.radius;
            mesh.position.z = Math.sin(move.angle) * move.radius;
            mesh.position.y = 2 + Math.sin(loop.time) * 2;
            mesh.lookAt(0, 0, 0);
            
            move.update();
          });

          this.moveQy.execute().forEach(e => {
            const move = e.getOne('Move');
            const component = e.getOne('ThreeComponent');
            if(move == null) return;
            if(component == null) return;

            const mesh = component.mesh;
            move.velocity.y += move.gravity;
            move.velocity = move.velocity.multiplyScalar(move.decay);
            mesh.position.add(move.velocity);
            mesh.rotateZ(move.tilt_angle);
            move.update();
          });
    }
}