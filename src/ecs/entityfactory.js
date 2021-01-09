import { Color, Matrix4, Mesh, TetrahedronBufferGeometry, Vector3, MeshBasicMaterial } from "three";
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
                mesh: MeshFactory.createRing(80, 3)
            }]
        });

        this.ecs.createEntity({
            id: 'ring2',
            components: [{
                type: 'ThreeComponent',
                mesh: MeshFactory.createRing(160, 0.5)
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
                decay: 0.96
            }, {
                type: 'Weapon',
                attack_timer: 2,
                next_attack: 0.5,
                is_active: true,
                infinite_ammo: true
            }, {
                type: 'Trail',
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
            },{
                type: 'Move',
                velocity: direction.multiplyScalar(2)
            },{
                type: 'TargetColor',
                color: new Color(0xfff4d4),
                duration: 1
            },{
                type: 'DeleteTimer',
                time_left: 0.8
            },{
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
        const geoms = [];
        const material = new MeshBasicMaterial({color: 0xff00ff});
        const m4 = new Matrix4();
        for (let l = 0; l < 3; l++) {
            const n = 3 * (l + 1) * (l + 1);
            const s = Math.max(900 - 650 * l, 10);
            const r = 800 - 180 * (l * 1.5);

            // console.log(`l: ${l} n:${n}, s:${s}, r:${r}`);
            const base = new TetrahedronBufferGeometry(s, l);
            for (let i = 0; i < n; i++) {
                const radius = r;
                const angle = i * (2 / n) * Math.PI;

                const geo = base.clone();
                m4.makeTranslation(
                    Math.cos(angle) * radius,
                    Math.sin(i) * 300,
                    Math.sin(angle) * radius
                );
                // m4.makeRotationAxis(
                //     new Vector3(0,1, 0), 
                //     Math.random() * Math.PI
                // );
                geo.applyMatrix4(m4);
                geoms.push(geo);
            }
        }

        const mesh = new Mesh(
            BufferGeometryUtils.mergeBufferGeometries(geoms), 
            material
        );
        this.ecs.createEntity({
            id: `asteroids`,
            components: [{
                type: 'ThreeComponent',
                mesh: mesh
            }]
        });
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