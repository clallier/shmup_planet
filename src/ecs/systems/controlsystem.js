import { System } from "ape-ecs";

export default class ControlSystem extends System {
    init() {
        this.event = null;
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
                move.speed += 0.01;
                
            if (this.event == 'move_right')
                move.speed -= 0.01;
        });

        this.event = null;
    }
}