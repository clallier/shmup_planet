import {
    Vector3, Mesh, Group,
    IcosahedronGeometry, RingGeometry, TetrahedronGeometry, BoxGeometry,
    ShaderMaterial, MeshBasicMaterial,
    Points, CylinderGeometry,
    BufferGeometry, BufferAttribute,
} from "three";
import Palette from './palette'
import CanvasFactory from "./canvasfactory";

import displacement_fg from './shaders/displacement_fg.glsl';
import displacement_vx from './shaders/displacement_vx.glsl';
import particles_fg from './shaders/particles_fg.glsl';
import particles_vx from './shaders/particles_vx.glsl';

export default class MeshFactory {
    static createPlanet() {
        const geometry = new IcosahedronGeometry(20, 6);
        const material = new ShaderMaterial({
            uniforms: {
                // float initialized to 0
                time: { type: "f", value: 0.0 },
            },
            vertexShader: displacement_vx,
            fragmentShader: displacement_fg
        });
        // create a sphere and assign the material
        const mesh = new Mesh(
            geometry,
            material
        );

        return mesh;
    }

    static createRing(outerRadius = 1.0,
        width = 1.0,
        color = Palette.light,
        position = new Vector3()) {
        const geometry = new RingGeometry(
            outerRadius - width,
            outerRadius,
            60, // segments largeur
            1); // segments profondeur
        const material = new MeshBasicMaterial({
            color: color
        });
        const mesh = new Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.rotation.x = -Math.PI / 2;

        return mesh;
    }

    static createTetra(
        radius = 1.0,
        detail = 0,
        color = Palette.pink,
        position = new Vector3()) {
        const geometry = new TetrahedronGeometry(
            radius,
            detail); // detail

        const material = new MeshBasicMaterial({
            color: color
        });
        const mesh = new Mesh(geometry, material);
        mesh.position.copy(position);

        return mesh;
    }

    static createBox(
        width = 1.0,
        height = 1.0,
        depth = 1.0,
        color = Palette.light_blue,
        position = new Vector3()) {
        const geometry = new BoxGeometry(width, height, depth);
        const material = new MeshBasicMaterial({
            color: color
        });
        const mesh = new Mesh(geometry, material);
        mesh.position.copy(position);

        return mesh;
    }

    static createPoints(config = {}) {
        const position = config.position || new Vector3();
        const count = config.count || 100;
        const point_size = config.point_size || 0;
        const system_size = config.system_size || 5;
        const texture = config.texture || CanvasFactory.createTexture();
        const dynamic = config.dynamic || false;
        const geometry = config.geometry || MeshFactory.createRandomBufferGeometry(count, system_size);

        const material = new ShaderMaterial({
            uniforms: {
                u_texture: { type: "t", value: texture },
                u_size: { type: "f", value: point_size }
            },
            vertexShader: particles_vx,
            fragmentShader: particles_fg,
            alphaTest: 0.5,
            transparent: true,
            depthTest: true
        })

        // const material = new PointsMaterial({
        //     color,
        //     size: point_size,
        //     map: texture,
        //     alphaTest: 0.5, 
        //     transparent: true
        // });

        // Three.ParticlesSystem
        const mesh = new Points(geometry, material);
        mesh.position.copy(position);
        mesh.dynamic = dynamic;
        mesh.sortParticles = dynamic;
        return mesh;
    }

    static createCylinder(config = {}) {
        const radiusTop = config.radiusTop || 4;
        const radiusBottom = config.radiusBottom || 4;
        const height = config.height || 4;
        const radialSegments = config.radialSegments || 4;
        const color = config.color || Palette.debug_color;
        const position = config.position || new Vector3();

        var geometry = new CylinderGeometry(
            radiusTop,
            radiusBottom,
            height,
            radialSegments);

        const material = new MeshBasicMaterial({
            color
        });
        const mesh = new Mesh(geometry, material);
        mesh.position.copy(position);

        return mesh;
    }

    static createRandomBufferGeometry(count, system_size) {
        const geometry = new BufferGeometry();
        const vertices = new Float32Array(count * 3);

        const v3 = new Vector3();
        for (let i = 0; i < count; i++) {
            v3.random()
                .addScalar(-0.5)
                .setLength(system_size);

            vertices.set(v3.toArray(), i * 3);
        }
        geometry.setAttribute('position', new BufferAttribute(vertices, 3));
        return geometry;
    }

    static createSpaceShip(config = {}) {
        const body_color = config.body_color || Palette.light;
        const line_color = config.line_color || Palette.dark;
        const cockpit_color = config.cockpit_color || Palette.light_blue;
        const reactor_color = config.reactor_color || Palette.dark;

        const position = config.position || new Vector3();

        const group = new Group();
        const mesh = new Mesh();
        const body = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 3,
            height: 3,
            radialSegments: 4,
            color: body_color,
            position: new Vector3(0, -1, 0)
        });
        mesh.add(body)

        const cockpit = MeshFactory.createCylinder({
            radiusTop: 2.5,
            radiusBottom: 3.4,
            height: 1,
            radialSegments: 4,
            color: cockpit_color,
            position: new Vector3(0, -1.5, 0)
        });
        mesh.add(cockpit);

        const right_arm = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 3,
            height: 6,
            radialSegments: 4,
            color: body_color,
            position: new Vector3(-4, 0, 0)
        });
        mesh.add(right_arm);

        const right_line = MeshFactory.createCylinder({
            radiusTop: 3,
            radiusBottom: 3,
            height: 0.5,
            radialSegments: 4,
            color: line_color,
            position: new Vector3(-4, -1, 0)
        });
        mesh.add(right_line);

        const right_reactor = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 1,
            height: 1,
            radialSegments: 4,
            color: reactor_color,
            position: new Vector3(-4, -3.5, 0)
        });
        mesh.add(right_reactor);

        const left_arm = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 3,
            height: 6,
            radialSegments: 4,
            color: body_color,
            position: new Vector3(4, 0, 0)
        });
        mesh.add(left_arm);

        const left_line = MeshFactory.createCylinder({
            radiusTop: 3,
            radiusBottom: 3,
            height: 0.5,
            radialSegments: 4,
            color: line_color,
            position: new Vector3(4, -1, 0)
        });
        mesh.add(left_line);

        const left_reactor = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 1,
            height: 1,
            radialSegments: 4,
            color: reactor_color,
            position: new Vector3(4, -3.5, 0)
        });
        mesh.add(left_reactor);

        const center_reactor = MeshFactory.createCylinder({
            radiusTop: 2,
            radiusBottom: 1,
            height: 1,
            radialSegments: 4,
            color: reactor_color,
            position: new Vector3(0, -3, 0)
        });
        mesh.add(center_reactor);

        // construction
        mesh.rotateX(Math.PI / 2);
        group.add(mesh);
        group.position.copy(position);
        return group;
    }
}