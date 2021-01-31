import { System } from "ape-ecs";

export default class ControlSystem extends System {
    init() {
        this.event = null;
        this.controllableQy = this.createQuery()
            .fromAll('Controllable', 'MoveAlongRing');

        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            if (e.code == 'ArrowLeft')
                this.event = 'move_left';
            if (e.code == 'ArrowRight')
                this.event = 'move_right';
        })

        document.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            const target = e.target;
            const x = e.clientX / target.clientWidth;
            const y = e.clientY / target.clientHeight;
            
            // console.log(`e x:${x.toFixed(2)}, y:${y.toFixed(2)}`);

            if(y > 0.6 && x < 0.5) {
                this.event = 'move_left';
            }
            if(y > 0.6 && x > 0.5) {
                this.event = 'move_right';
            }
        })


        // =======================================

        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            if (e.code == 'ArrowLeft')
                this.event = null;
            if (e.code == 'ArrowRight')
                this.event = null;
        })

        document.addEventListener('pointerup', (e) => {
            e.preventDefault();
            this.event = null;
        })

    }

    update() {
        const loop = this.world.getEntity('game').getOne('GameLoop');

        this.controllableQy.execute().forEach(entity => {
            const move = entity.getOne('MoveAlongRing');
            
            if (this.event == 'move_left') {
                move.velocity += move.force * loop.delta;
                move.update();
            }
                
            if (this.event == 'move_right') {
                move.velocity -= move.force * loop.delta;
                move.update();
            }

        });
    }
}