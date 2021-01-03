import { Color, Vector3 } from "three";
import MeshFactory from "../meshfactory";
import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl';

export default class EntityFactory {
    constructor(ecs) {
        this.ecs = ecs;
    }

    createGameLoop() {
        this.ecs.createEntity({
            id: 'game',
            components: [{
                type: 'GameLoop'
            }]
        });
    }

    createTest() {
        this.ecs.createEntity({
            id: 'test',
            components: [{
                type: 'DeleteTimer',
                time_left: 2
            }]
        });
    }

    createPlanet() {
        this.ecs.createEntity({
            id: 'planet',
            tags: ['UpdateShader'],
            components: [{
                type: 'ThreeComponent',
                mesh: MeshFactory.createPlanet(vertex, fragment)
            }]
        });
    }

    createRings() {
        this.ecs.createEntity({
            id: 'ring1',
            components: [{
                type: 'ThreeComponent',
                mesh: MeshFactory.createRing(80, 4)
            }]
        });

        this.ecs.createEntity({
            id: 'ring2',
            components: [{
                type: 'ThreeComponent',
                mesh: MeshFactory.createRing(160, 4)
            }]
        });
    }

    createPlayer() {
        this.ecs.createEntity({
            id: 'player',
            tags: ['Controllable', 'CameraTarget'],
            components: [{
                type: 'ThreeComponent',
                mesh: MeshFactory.createTetra(6)
            }, {
                type: 'MoveAlongRing',
                radius: 160,
                angle: 0,
                speed: 0,
                decay: 0.96
            }, {
                type: 'Weapon',
                attack_timer: 2,
                next_attack: 0.5,
                is_active: true,
                infinite_ammo: true
            }]
        });
    }

    createBullet(type, position, direction) {
        let mesh = null;
        if (type == 'bullet')
            mesh = MeshFactory.createBox(4, 4, 4, 0x00aaaa);
        else
            console.warn('unknown bullet type');

        this.ecs.createEntity({
            tags: ['Bullet'],
            components: [{
                type: 'ThreeComponent',
                mesh: mesh,
                position: position,
                rotation: direction,
            }, {
                type: 'Move',
                velocity: direction.multiplyScalar(2)
            }, {
                type: 'DeleteTimer',
                time_left: 1
            }, {
                type: 'Collider',
                against: 'Enemy'
            }]
        });
    }

    createParticle(config = {}) {
        const position = config.position || new Vector3();
        const direction = config.direction || new Vector3();
        const decay = config.decay || 0;
        const tilt = config.tilt || 0;
        const ttl = config.ttl || 1;
        
        this.ecs.createEntity({
            tags: ['Particle'],
            components: [{
                type: 'ThreeComponent',
                mesh: MeshFactory.createTetra(3, 0, 0xff5500),
                position: position,
                rotation: direction,
            }, {
                type: 'Move',
                velocity: direction,
                decay: decay,
                gravity: -0.06,
                tilt_angle: tilt
            },{
                type: 'TargetColor',
                color: new Color(0xfff4d4),
                duration: ttl
            },{
                type: 'DeleteTimer',
                time_left: ttl
            }]
        });
    }

    createBackground() {
        // asteroids
        for (let l = 0; l < 3; l++) {
            const n = 3 * (l + 1) * (l + 1);
            const s = Math.max(900 - 650 * l, 10);
            const r = 800 - 180 * (l * 1.5);

            // console.log(`l: ${l} n:${n}, s:${s}, r:${r}`);
            for (let i = 0; i < n; i++) {
                const radius = r;
                const angle = i * (2 / n) * Math.PI;

                const position = new Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(i) * 300,
                    Math.sin(angle) * radius
                );

                this.ecs.createEntity({
                    id: `asteroid_${l}x${i}`,
                    components: [{
                        type: 'ThreeComponent',
                        mesh: MeshFactory.createTetra(s, l, 0xff00ff),
                        position: position
                    }]
                });
            }
        }
    }

    createEnemies() {
        // TODO wave system
        const radius = 80;
        for (let i = 0; i < 3; i++) {
            // const attack_timer = Math.random() * 4;
            // const next_attack = e.attack_timer; 
            const angle = Math.random() * 2 * Math.PI;
            const position = new Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );

            this.ecs.createEntity({
                id: `enemy_${i}`,
                tags: ['Enemy', 'Explodes'],
                components: [{
                    type: 'ThreeComponent',
                    mesh: MeshFactory.createTetra(12),
                    position: position
                }, {
                    type: 'MoveAlongRing',
                    radius: radius,
                    angle: angle,
                    speed: 0
                }, {
                    type: 'Collider'
                }]
            });
        }
    }

    createTestEnemy() {
        const radius = 80;
        const angle = 0;
        const position = new Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );

        this.ecs.createEntity({
            id: 'enemy_test',
            tags: ['Enemy', 'Explodes'],
            components: [{
                type: 'ThreeComponent',
                mesh: MeshFactory.createTetra(12),
                position: position
            }, {
                type: 'MoveAlongRing',
                radius: radius,
                angle: angle,
                speed: 0
            }, {
                type: 'Collider'
            }]
        });
    }

    
}