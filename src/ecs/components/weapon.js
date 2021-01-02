import { Component } from "ape-ecs";

export default class Weapon extends Component {
    static properties = {
        ammo_type: 'bullet',
        infinite_ammo: false,
        ammo_left: 1,
        attack_timer: 0.5,
        next_attack: 0.5,
        is_active: true
    }
}