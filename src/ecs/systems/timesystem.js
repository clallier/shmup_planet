
import { System } from "ape-ecs";

export default class TimeSystem extends System {
  init() {
    this.timerQy = this.createQuery()
      .fromAll('DeleteTimer').persist();
  }

  update() {
    const loop = this.world.getEntity('game').getOne('GameLoop');
    
    this.timerQy.execute().forEach(e => {
      const timer = e.getOne('DeleteTimer');
      if(timer == null) return;
      
      timer.time_left -= loop.delta;
      timer.update();
      if(timer.time_left <= 0) {
        // console.log(`entity ${e.id} marked for delete`)
        e.addComponent({type: 'Destroy'});
      }
    });
  }
}