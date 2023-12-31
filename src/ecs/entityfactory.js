import { Color, Matrix4, Mesh, TetrahedronBufferGeometry, Vector3, MeshBasicMaterial, Group } from "three";
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import MeshFactory from "../meshfactory";
import Palette from "../palette";
import { EmitterFactory } from "../ecs/components/particlesemitter"

export default class EntityFactory {
    static init(ecs) {
        this.ecs = ecs;
    }

    static createGameLoop() {
        this.ecs.createEntity({
            id: 'game',
            components: [{
                type: 'GameLoop'
            }]
        });
    }

    static createTest() {
        this.ecs.createEntity({
            id: 'test',
            components: [{
                type: 'DeleteTimer',
                time_left: 2
            }]
        });
    }

    static createPlanet() {
        const mesh = MeshFactory.createPlanet();
        mesh.add(MeshFactory.createPoints({
            system_size: 40,
            point_size: 1
        }));

        this.ecs.createEntity({
            id: 'planet',
            tags: ['UpdateShader'],
            components: [{
                type: 'ThreeComponent',
                mesh: mesh
            }]
        });
    }

    static createRings() {
        this.ecs.createEntity({
            id: 'ring1',
            components: [{
                type: 'ThreeComponent',
                mesh: MeshFactory.createRing({
                    outer_radius: 80,
                    width: 3,
                    color: Palette.dark_red
                })
            }]
        });

        this.ecs.createEntity({
            id: 'ring2',
            components: [{
                type: 'ThreeComponent',
                mesh: MeshFactory.createRing({
                    outer_radius: 80,
                    width: 3,
                    color: Palette.dark_red
                })
            }]
        });
    }

    static createPlayer() {
        const mesh = MeshFactory.createSpaceShip();

        this.ecs.createEntity({
            id: 'player',
            tags: ['Controllable', 'CameraTarget'],
            components: [{
                type: 'ThreeComponent',
                mesh,
            }, {
                type: 'MoveAlongRing',
                radius: 160,
                force: 10,
                max_velocity: 5,
                decay: 0.96
            }, {
                type: 'Weapon'
            },
            EmitterFactory.createTrail(.5)
            ]
        });
    }

    static createBullet(type, position, direction) {
        let mesh = null;
        if (type == 'bullet')
            mesh = MeshFactory.createTetra({
                radius: 4,
                color: Palette.dark_blue
            });
        else
            console.warn('unknown bullet type');

        const velocity = direction.clone().multiplyScalar(100); // 200u/s

        this.ecs.createEntity({
            tags: ['Bullet'],
            components: [{
                type: 'ThreeComponent',
                mesh: mesh,
                position: position,
                rotation: direction.clone(),
            }, {
                type: 'Move',
                velocity,
                tilt_angle: 0.1
            }, {
                type: 'TweenColor',
                start: new Color(Palette.red),
                end: new Color(Palette.light),
                duration: 0.4
            }, {
                type: 'DeleteTimer',
                time_left: 0.8
            }, {
                type: 'Collider',
                against: 'Enemy'
            },
            EmitterFactory.createTrail()
            ]
        });
    }

    static createBackground() {
        // asteroids
        const geoms = [];
        const material = new MeshBasicMaterial({ color: Palette.dark_red });
        const m4 = new Matrix4();
        for (let l = 0; l < 3; l++) {
            const n = 4 * (l + 1) ** 3;
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
                geo.applyMatrix4(m4);
                geoms.push(geo);
            }
        }

        const mesh = new Mesh();
        mesh.add(new Mesh(
            BufferGeometryUtils.mergeBufferGeometries(geoms),
            material
        ));

        mesh.add(MeshFactory.createPoints({
            system_size: 200,
            point_size: 3,
        }));

        this.ecs.createEntity({
            id: `asteroids`,
            components: [{
                type: 'ThreeComponent',
                mesh: mesh
            }]
        });
    }

    static createEnemies(count = 3) {
        // TODO wave system

        const radius = 80;
        for (let i = 0; i < count; i++) {
            // const attack_timer = Math.random() * 4;
            // const next_attack = e.attack_timer; 
            const angle = Math.random() * 2 * Math.PI;
            const size = Math.random() * 5 + 10;
            const position = new Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );

            let mesh = null;
            if (Math.random() < 0.9)
                mesh = MeshFactory.createTetra({
                    radius: size,
                    detail: 1,
                    color: Palette.red
                })
            else
                mesh = MeshFactory.createSaucer()

            this.ecs.createEntity({
                tags: ['Enemy', 'Explodes'],
                components: [{
                    type: 'ThreeComponent',
                    mesh,
                    position: position
                }, {
                    type: 'MoveAlongRing',
                    radius: radius,
                    angle: angle,
                }, {
                    type: 'Collider'
                }]
            });
        }
    }

    static createTestEnemy() {
        const radius = 80;
        const angle = 0;
        const position = new Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );

        const mesh = MeshFactory.createSaucer();

        this.ecs.createEntity({
            id: 'enemy_test',
            tags: ['Enemy', 'Explodes'],
            components: [{
                type: 'ThreeComponent',
                position: position,
                mesh
            }, {
                type: 'MoveAlongRing',
                radius,
                angle
            }, {
                type: 'Collider'
            }]
        });
    }


    static createParticleExplosion(config = {}) {
        const position = config.position || new Vector3();
        const time_left = config.time_left || 2;

        this.ecs.createEntity({
            components: [
                { type: 'ThreeComponent', mesh: new Mesh(), position },
                { type: 'DeleteTimer', time_left },
                { type: 'ScreenShake' },
                EmitterFactory.createExplosion()
            ]
        })
    }

}