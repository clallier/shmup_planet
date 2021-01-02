
import { System } from "ape-ecs";

export default class DeleteSystem extends System {
    init() {
        this.subscribe('Destroy');
    }

    update() {
        this.changes.forEach(c => {
            if (c.op == 'add') {
                // console.log(`destroy entity ${c.entity}`)
                this.world.removeEntity(c.entity);
            }
        })
    }
}