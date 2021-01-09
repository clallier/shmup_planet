import { System } from "ape-ecs";

export default class ControlSystem extends System {
    init() {
        this.event = null;
        this.force = 0.008;
        this.controllableQy = this.createQuery()
            .fromAll('Controllable', 'MoveAlongRing');

        document.addEventListener('keydown', (e) => {
            if (e.code == 'ArrowLeft')
                this.event = 'move_left';
            if (e.code == 'ArrowRight')
                this.event = 'move_right';
        })
    }

    update() {
        const loop = this.world.getEntity('game').getOne('GameLoop');

        this.controllableQy.execute().forEach(entity => {
            const move = entity.getOne('MoveAlongRing');
            
            if (this.event == 'move_left')
                move.speed += this.force;
                
            if (this.event == 'move_right')
                move.speed -= this.force;
        });

        this.event = null;
    }
}