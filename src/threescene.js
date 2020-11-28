import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Scene, WebGLRenderer, PerspectiveCamera, PCFSoftShadowMap, DirectionalLight, AmbientLight, HemisphereLight, Vector3, ShaderMaterial } from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL.js';
import { MeshBasicMaterial, Mesh, IcosahedronGeometry } from 'three';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

export default class ThreeScene {
    constructor() {
        if (WEBGL.isWebGL2Available() === false) {
            document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
        }

        this.canvas = document.querySelector('#canvas');
        // const context = this.canvas.getContext('webgl2', { alpha: true });
        this.renderer = new WebGLRenderer({ canvas: this.canvas /*, context*/ });
        this.renderer.premultipliedAlpha = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;


        this.camera = new PerspectiveCamera(75, 2, 0.1, 1000);
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 100;

        this.control = new OrbitControls(this.camera, this.canvas);
        this.control.enabled = true;
        this.scene = new Scene();

        this.lights = [];
        // TODO : https://threejs.org/editor/ pour setup des lights
        // this.lights.push(new AmbientLight(0xffa500, .2))
        // this.lights.push(new HemisphereLight(0xffa500, 0x4ba787, .2))

        // const directionalLight = new DirectionalLight(0xffffff, 1);
        // directionalLight.position.set(0, 30, 0);

        // this.lights.push(directionalLight);
        
        for (let i = 0; i < this.lights.length; i++)
            this.scene.add(this.lights[i]);

        // create a shader material
        this.material = new ShaderMaterial( {
            uniforms: {
                // float initialized to 0
                time: { type: "f", value: 0.0},
            },
            vertexShader: vertex,
            fragmentShader: fragment
        } );

        // create a sphere and assign the material
        const mesh = new Mesh(
            new IcosahedronGeometry( 20, 6),
            this.material
        );
        this.scene.add( mesh );

    }

    render(time, delta) {
        console.log(time)
        this.material.uniforms[ 'time' ].value = .0001 * time;

        this.control.update();
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        // https://stackoverflow.com/questions/20290402/three-js-resizing-canvas
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height, false);
        }
    }
} 