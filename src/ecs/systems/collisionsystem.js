import { System } from "ape-ecs";

export default class CollisionSystem extends System {
  init() {
    this.colliderQy = this.createQuery()
      .fromAll('Collider').persist();
  }

  update() {    
    const entities = this.colliderQy.execute();
    entities.forEach(e => {
      const e_collider = e.getOne('Collider');
      if(e_collider.against == null) return;

      // const test = e_collider.against.map((t) => (typeof t !== 'string' ? t.name : t));
      const potential = this.createQuery().fromAll(e_collider.against).execute();

      const e_component = e.getOne('ThreeComponent');
      const e_mesh = e_component.mesh;

      potential.forEach(i => {
        const i_collider = i.getOne('Collider');
        const i_component = i.getOne('ThreeComponent');
        const i_mesh = i_component.mesh;
        
        if(i_collider.checked) return;

        const d = e_mesh.position.distanceTo(i_mesh.position);
        // console.log(`dist: ${d}`)
        if(d < 10) {
          // TODO : compute collision dist 
          // console.log(`${e.id} collide with ${i.id}`);
          if(i.has('Explodes')) {
            // console.log(`${i.id} Explodes`);
            i.removeTag('Explodes');
            i.addComponent({type: 'ParticlesEmitter'});
            i.addComponent({type: 'ScreenShake'});
            i.addComponent({type: 'DeleteTimer', time_left: 0.1});
            
          }
        }
      })
      
      e_collider.update({checked: true});
    });

    // reset checked
    entities.forEach(e => e.getOne('Collider').update({checked: false}));
  }
}