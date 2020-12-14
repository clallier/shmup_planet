
import { System } from "ape-ecs";

export default class TimeSystem extends System {
  init() {
    this.query = this.createQuery().fromAll('DeleteTimer'); 
  }

  update(tick) {
    const entities = this.query.execute();
    for (const entity of entities) {
      console.log(`${entity.id}: ${Object.keys(entity.types).length} ready: ${entity.ready}`);
      const timer = entity.getOne('DeleteTimer');
      if(timer != null) {
        timer.time_left -= 1;
        timer.update();
        console.log(timer.time_left);
        if(timer.time_left <= 0) {
          console.log("destroyed");
          entity.destroy()
        }
      }
    }
  }
}