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
      if (weapon == null) return;
      if (component == null) return;

      // can emit bullet?
      const is_active = weapon.is_active &&
        (weapon.infinite_reload ||
          weapon.reload_left >= 0 ||
          weapon.ammo_left > 0);

      if (is_active == false) return;

      // we have ammo and we are not reloading
      if (weapon.ammo_left > 0 && weapon.reload_cooldown <= 0) {
        weapon.ammo_cooldown -= loop.delta;
      }

      // we have no ammo but we are reloading 
      if (weapon.ammo_left <= 0 && weapon.reload_cooldown > 0) {
        weapon.reload_cooldown -= loop.delta;
      }
      
      // we have no ammo and reloading is done
      if (weapon.ammo_left <= 0 && weapon.reload_cooldown <= 0) {
        weapon.ammo_left = weapon.ammo_per_reload;
      }

      // if the ammo coolown is done
      if (weapon.ammo_cooldown <= 0 && weapon.reload_cooldown <= 0) {
        
        // if we have ammo: update bullet count
        if (weapon.ammo_left > 0) {
          weapon.ammo_left -= 1;
          // reset the ammo cooldown 
          weapon.ammo_cooldown = weapon.ammo_timer;      
        }

        // if no ammo left: reload
        if (weapon.ammo_left <= 0) {
          weapon.reload_left -= 1;
          weapon.reload_cooldown = weapon.reload_timer;
          weapon.ammo_cooldown = 0;
        }

        if(weapon.reload_left <= 0 && weapon.infinite_reload)
          weapon.reload_left = 1;

        // bullet
        const mesh = component.mesh;
        const pos = mesh.position;
        const dir = new Vector3();
        mesh.getWorldDirection(dir);
        EntityFactory.createBullet(weapon.ammo_type, pos, dir);
        e.addComponent({ type: 'ScreenShake', power: 3, duration: 0.05 })
      }

      weapon.update();
    });
  }
}