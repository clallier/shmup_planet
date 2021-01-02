import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Scene, WebGLRenderer, PerspectiveCamera, PCFSoftShadowMap, Vector3, Fog, FogExp2 } from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL.js';

import MeshFactory from './meshfactory';

export default class ThreeScene {
    constructor() {
        if (WEBGL.isWebGL2Available() === false) {
            document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
        }

        this.canvas = document.querySelector('#canvas');
        this.renderer = new WebGLRenderer({canvas: this.canvas/*, context*/});
        this.renderer.premultipliedAlpha = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.setClearColor(0x052222, 1);

        this.camera = new PerspectiveCamera(100, 2, 0.1, 1000);
        this.camera.position.x = 0;
        this.camera.position.y = 15;
        this.camera.position.z = 200;

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

        this.scene.fog = new FogExp2(0x052525, 0.0035);
    }

    render() {
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