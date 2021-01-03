
import { System } from "ape-ecs";

export default class TimeSystem extends System {
  init() {
    this.timerQy = this.createQuery()
      .fromAll('DeleteTimer').persist();

    this.screenShakeQy = this.createQuery()
      .fromAll('ScreenShake').persist();
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

    this.screenShakeQy.execute().forEach(e => {
      const screenShake = e.getOne('ScreenShake');
      if(screenShake == null) return;

      screenShake.duration -= loop.delta;
      screenShake.update();

      if(screenShake.duration <= 0) {
          e.removeComponent(screenShake);
      }
  })
  }
}