import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Scene, WebGLRenderer, PerspectiveCamera, PCFSoftShadowMap, Vector3 } from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL.js';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import MeshFactory from './meshfactory';

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


        this.planet = MeshFactory.createPlanet(vertex, fragment);
        this.scene.add(this.planet);

        this.scene.add(MeshFactory.createRing(80, 4))
        this.scene.add(MeshFactory.createRing(160, 4))

        this.player = MeshFactory.createTetra(6);
        this.player.radius = 160;
        this.player.attack_timer = 0.5;
        this.player.next_attack = this.player.attack_timer; 
        this.player.angle = 0;
        this.player.min_angle = 0;
        this.player.max_angle = 2 * Math.PI;
        this.player.speed = 0;
        this.player.position.z = this.player.radius;
        this.scene.add(this.player);
        document.addEventListener('keydown', (e) => {
            if (e.code == 'ArrowLeft')
                this.player.speed += 0.01;
            if (e.code == 'ArrowRight')
                this.player.speed -= 0.01;
        })

        this.enemies = [];
        for (let i = 0; i < 3; i++) {
            const e = MeshFactory.createTetra(12);
            e.radius = 80;
            e.attack_timer = Math.random() * 4;
            e.next_attack = e.attack_timer; 
            e.angle = Math.random() * 2 * Math.PI;
            e.max_angle = e.angle + 2 * Math.PI;
            e.position.z = e.radius;
            e.position.x = 0 + Math.cos(e.angle) * e.radius;
            e.position.z = 0 + Math.sin(e.angle) * e.radius;
            this.enemies.push(e);
            this.scene.add(e);
        }

        this.bullets = [];
    }

    render(time, delta) {
        this.planet.material.uniforms['time'].value = time;

        this.player.next_attack -= delta;

        if(this.player.next_attack <= 0) {
            this.player.next_attack = this.player.attack_timer;
            const b = MeshFactory.createBox(4, 4, 4, 0x00aaaa);
            b.velocity = new Vector3();
            this.player.getWorldDirection(b.velocity);
            b.velocity.setLength(2);
            b.position.copy(this.player.position);
            this.bullets.push(b);
            this.scene.add(b);
        }

        this.player.speed *= 0.97;
        if (this.player.speed > 0.1)
            this.player.speed == 0.1;
        if (this.player.speed < -0.1)
            this.player.speed == -0.1;
        this.player.angle += this.player.speed;

        if (this.player.angle > this.player.max_angle)
            this.player.angle -= this.player.max_angle;
        if (this.player.angle < this.player.min_angle)
            this.player.angle += this.player.max_angle;

        this.player.position.x = 0 + Math.cos(this.player.angle) * this.player.radius;
        this.player.position.z = 0 + Math.sin(this.player.angle) * this.player.radius;
        this.player.lookAt(0, 0, 0);

        this.camera.position.x = 0 + Math.cos(this.player.angle) * (this.player.radius + 20);
        this.camera.position.z = 0 + Math.sin(this.player.angle) * (this.player.radius + 20);
        this.camera.lookAt(0, 0, 0);

        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i];
            e.lookAt(this.player.position);
            e.next_attack -= delta;

            if(e.next_attack <= 0) {
                e.next_attack = e.attack_timer;
                const b = MeshFactory.createBox(4, 4, 4);
                b.velocity = new Vector3();
                e.getWorldDirection(b.velocity);
                b.velocity.setLength(2);
                b.position.copy(e.position);
                this.bullets.push(b);
                this.scene.add(b);
            }
        }

        
        for (let i = 0; i < this.bullets.length; i++) {
            const b = this.bullets[i];
            b.position.add(b.velocity);
        }

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