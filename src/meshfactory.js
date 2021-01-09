import {
    Vector3, Mesh,
    IcosahedronGeometry, RingGeometry, TetrahedronGeometry,
    BoxGeometry,
    ShaderMaterial, MeshBasicMaterial,
    BufferGeometry, PointsMaterial, Points
} from "three";

export class Palette {
    static debug_color = 0x00ff00;

    static light = 0xffebf3;
    static grey = 0x805489;
    static dark = 0x021423;

    static yellow = 0xf7cb01;

    static pink = 0xf700ff;
    static red = 0xf73201; 
    static dark_red = 0xc41c01;

    static light_blue = 0x00cbff;
    static dark_blue = 0x0076ab;
}

export class MeshFactory {
    static createPlanet(vertexShader, fragmentShader) {
        const geometry = new IcosahedronGeometry(20, 6);
        const material = new ShaderMaterial({
            uniforms: {
                // float initialized to 0
                time: { type: "f", value: 0.0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
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

    static createPoints(
        color = Palette.pink,
        position = new Vector3()) {
        const geometry = new BufferGeometry();
        const material = new PointsMaterial({
            color: color,
            size: 40,
            vertexColors: true
        });
        const mesh = new Points(geometry, material);
        mesh.position.copy(position);

        return mesh;
    }
}