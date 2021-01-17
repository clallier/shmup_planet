import { Component } from "ape-ecs";

export default class Weapon extends Component {
    static properties = {
        ammo_type: 'bullet',
        infinite_reload: true,
        is_active: true,
        ammo_per_reload: 3,
        
        ammo_left: 1,
        // timer: the time to wait 
        ammo_timer: 0.4,
        // cooldown: should be init to reload_timer
        ammo_cooldown: 0.4,

        reload_left: 3,
        // timer: the time to wait 
        reload_timer: 2,
        // cooldown: should be init to 0
        reload_cooldown: 0
    }
}