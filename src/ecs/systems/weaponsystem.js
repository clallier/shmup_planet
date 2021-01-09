import { System } from "ape-ecs";
import { Vector3 } from "three";
import EntityFactory from '../entityfactory';

export default class WeaponSystem extends System {
  init() {
    this.query = this.createQuery().fromAll('Weapon', 'ThreeComponent');
  }

  update() {
    const loop = this.world.getEntity('game').getOne('GameLoop');
    
    this.query.execute().forEach(e => {
      const weapon = e.getOne('Weapon');
      const component = e.getOne('ThreeComponent');
      if(weapon == null) return;
      if(component == null) return;

      const is_active = weapon.is_active && 
        (weapon.infinite_ammo || weapon.ammo_left > 0); 
      
      if(is_active == false) return;
      const mesh = component.mesh;
      weapon.next_attack -= loop.delta;

      if(weapon.next_attack <= 0) {
        weapon.next_attack = weapon.attack_timer;
        if(weapon.ammo_left > 0) weapon.ammo_left -= 1;
        // bullet
        const pos = mesh.position;
        const dir = new Vector3();
        mesh.getWorldDirection(dir);
        EntityFactory.createBullet(weapon.ammo_type, pos, dir);
        e.addComponent({type:'ScreenShake', power: 3, duration: 0.05})
      }

      weapon.update();
    });
  }
}