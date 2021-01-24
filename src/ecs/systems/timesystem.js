import { System } from "ape-ecs";
import CoroutineRunner from "../../coroutinerunner";
import EntityFactory from "../entityfactory";


export default class TimeSystem extends System {
  init() {
    this.runner = new CoroutineRunner();

    this.subscribe('DeleteTimer');
    this.subscribe('Destroy');
    this.subscribe('ScreenShake');

    this.runner.add(this.createEnemies(), 3);
  }

  update() {
    const loop = this.world.getEntity('game').getOne('GameLoop');
    this.runner.update(loop.delta);

    this.changes.forEach(c => {
      if (c.op == 'add' && c.type == 'DeleteTimer') {
        const e = this.world.getEntity(c.entity);
        const delay = this.world.getComponent(c.component).time_left;
        this.runner.add(this.addDeleteComponent(e), delay)
      }

      else if (c.op == 'add' && c.type == 'Destroy') {
        const e = this.world.getEntity(c.entity);
        this.runner.add(this.removeEntity(e))
      }

      else if (c.op == 'add' && c.type == 'ScreenShake') {
        const entity = this.world.getEntity(c.entity);
        const component = this.world.getComponent(c.component);
        const delay = component.duration;
        this.runner.add(this.removeComponent(entity, component), delay)
      }
    })
  }

  *addDeleteComponent(e) {
    e.addComponent({ type: 'Destroy' });
  }

  *removeComponent(entity, c) {
    entity.removeComponent(c);
  }

  *removeEntity(e) {
    this.world.removeEntity(e);
  }

  *createEnemies() {
    // see: http://www.dabeaz.com/coroutines/Coroutines.pdf
    for (let i = 0; i < 10; i++) {
      EntityFactory.createEnemies(i);
      yield this.waitEndOfWave(i);

      // end of wave
      yield this.runner.waitSeconds(2);
    }
    console.log('Well done!')
  }

  *waitEndOfWave(i) {
    // check no enemies left for this wave
    while (true) {
      const enemies = this.world.getEntities('Enemy');
      enemies.delete(undefined);
      console.log(`Wave: ${i}, enemies: ${enemies.size}`);
      if (enemies.size == 0) break;
      yield this.runner.waitSeconds(1);
    }

  }
}
