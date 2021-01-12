import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Scene, WebGLRenderer, PerspectiveCamera, FogExp2, ReinhardToneMapping, Vector2, Color } from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import Palette from './palette';

export default class ThreeScene {
    constructor() {
        if (WEBGL.isWebGL2Available() === false) {
            document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
        }

        // setup 
        // renderer
        this.canvas = document.querySelector('#canvas');
        this.renderer = new WebGLRenderer({canvas: this.canvas/*, context*/});
        this.renderer.premultipliedAlpha = false;
        this.renderer.toneMapping = ReinhardToneMapping;
        this.renderer.toneMappingExposure = Math.pow(1.2, 4.0);
        // this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.setClearColor(Palette.dark, 1);
        // camera
        this.camera = new PerspectiveCamera(100, 2, 0.1, 1000);
        this.camera.position.x = 0;
        this.camera.position.y = 15;
        this.camera.position.z = 200;
        // camera default control
        this.control = new OrbitControls(this.camera, this.canvas);
        this.control.enabled = true;
        // scene
        this.scene = new Scene();
        
        // composer
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
       
        // const pass = new DotScreenPass(
        //     new Vector2(50, 50),   // center
        //     Math.PI / 6,  // angle
        //     32    // scale
        // );

        this.composer.addPass(new UnrealBloomPass(
            new Vector2(64, 64), // res
            1.1,    // strength
            1,      // radius
            0.2    //threshold
          ));

        // elements of scene
        this.lights = [];
        // TODO : https://threejs.org/editor/ pour setup des lights
        for (let i = 0; i < this.lights.length; i++)
            this.scene.add(this.lights[i]);

        this.scene.fog = new FogExp2(Palette.dark, 0.0035);
    }

    render(time, delta) {
        this.control.update();
        // this.renderer.render(this.scene, this.camera);
        this.composer.render(delta);
    }

    resize() {
        // https://stackoverflow.com/questions/20290402/three-js-resizing-canvas
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height, false);
            this.composer.setSize(width, height);
        }
    }
} 