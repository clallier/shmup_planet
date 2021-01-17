import { Color, Matrix4, Mesh, TetrahedronBufferGeometry, Vector3, MeshBasicMaterial, Group } from "three";
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import MeshFactory from "../meshfactory";
import Palette from "../palette";

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
                mesh: MeshFactory.createRing(80, 3, Palette.dark_red)
            }]
        });

        this.ecs.createEntity({
            id: 'ring2',
            components: [{
                type: 'ThreeComponent',
                mesh: MeshFactory.createRing(160, 0.5, Palette.dark_red)
            }]
        });
    }

    static createPlayer() {
        const group = new Group();
        const mesh = new Mesh();
        const body = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 3,
            height: 3,
            radialSegments: 4,
            color: Palette.light,
            position: new Vector3(0, -1, 0)
        }); 
        mesh.add(body)

        const cockpit = MeshFactory.createCylinder({
            radiusTop: 2.5,
            radiusBottom: 3.4,
            height: 1,
            radialSegments: 4,
            color: Palette.light_blue,
            position: new Vector3(0, -1.5, 0)
        });
        mesh.add(cockpit);

        const right_arm = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 3,
            height: 6,
            radialSegments: 4,
            color: Palette.light,
            position: new Vector3(-4, 0, 0)
        }); 
        mesh.add(right_arm);
        
        const right_line = MeshFactory.createCylinder({
            radiusTop: 3,
            radiusBottom: 3,
            height: 0.5,
            radialSegments: 4,
            color: Palette.dark,
            position: new Vector3(-4, -1, 0)
        });
        mesh.add(right_line);
        
        const right_reactor = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 1,
            height: 1,
            radialSegments: 4,
            color: Palette.dark,
            position: new Vector3(-4, -3.5, 0)
        }); 
        mesh.add(right_reactor);

        const left_arm = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 3,
            height: 6,
            radialSegments: 4,
            color: Palette.light,
            position: new Vector3(4, 0, 0)
        }); 
        mesh.add(left_arm);
        
        const left_line = MeshFactory.createCylinder({
            radiusTop: 3,
            radiusBottom: 3,
            height: 0.5,
            radialSegments: 4,
            color: Palette.dark,
            position: new Vector3(4, -1, 0)
        });
        mesh.add(left_line);
        
        const left_reactor = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 1,
            height: 1,
            radialSegments: 4,
            color: Palette.dark,
            position: new Vector3(4, -3.5, 0)
        }); 
        mesh.add(left_reactor);

        const center_reactor = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 1,
            height: 1,
            radialSegments: 4,
            color: Palette.dark,
            position: new Vector3(0, -3, 0)
        }); 
        mesh.add(center_reactor);

        // construction
        mesh.rotateX(Math.PI / 2);
        group.add(mesh);
        
        this.ecs.createEntity({
            id: 'player',
            tags: ['Controllable', 'CameraTarget'],
            components: [{
                type: 'ThreeComponent',
                mesh: group,
            }, {
                type: 'MoveAlongRing',
                radius: 160,
                angle: Math.PI / 2,
                decay: 0.96
            }, {
                type: 'Weapon'
            }]
        });
    }

    static createBullet(type, position, direction) {
        let mesh = null;
        if (type == 'bullet')
            mesh = MeshFactory.createBox(4, 4, 4, Palette.dark_blue);
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
                velocity: direction.clone().multiplyScalar(2)
            },{
                type: 'TargetColor',
                color: new Color(Palette.light),
                duration: 0.8
            },{
                type: 'DeleteTimer',
                time_left: 0.8
            },{
                type: 'Collider',
                against: 'Enemy'
            },{
                type: 'Trail',
                system_size: 4,
                count_per_s: 40,
                life: 0.8,
                velocity: direction.clone().multiplyScalar(-2),
                size_tween: true,
                size_start: 3,
                size_end: 0,
                color_tween: true,
                color_start: Palette.light,
                color_end: Palette.dark_red,
            }]
        });
    }

    static createParticle(config = {}) {
        const position = config.position || new Vector3();
        const direction = config.direction || new Vector3();
        const decay = config.decay || 0;
        const tilt = config.tilt || 0;
        const ttl = config.ttl || 1;
        
        this.ecs.createEntity({
            tags: ['Particle'],
            components: [{
                type: 'ThreeComponent',
                mesh: MeshFactory.createTetra(3, 0, Palette.red),
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
                color: new Color(Palette.light),
                duration: ttl
            },{
                type: 'DeleteTimer',
                time_left: ttl
            }]
        });
    }

    static createBackground() {
        // asteroids
        const geoms = [];
        const material = new MeshBasicMaterial({color: Palette.dark_red});
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

    static createEnemies() {
        // TODO wave system
        const radius = 80;
        for (let i = 0; i < 3; i++) {
            // const attack_timer = Math.random() * 4;
            // const next_attack = e.attack_timer; 
            const angle = Math.random() * 2 * Math.PI;
            const size = Math.random() * 5 + 10;
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
                    mesh: MeshFactory.createTetra(size, 1, Palette.red),
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

    static createTestEnemy() {
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