import { Destroy, DeleteTimer } from './ecs/components/deletetimer';
import GameLoop from './ecs/components/gameloop';
import { ThreeComponent, ScreenShake, TargetColor } from './ecs/components/threecomponent';
import { MoveAlongRing, Move } from './ecs/components/move';
import Weapon from './ecs/components/weapon';
import Collider from './ecs/components/collider';
import { Trail } from './ecs/components/particlesemitter';

import TimeSystem from './ecs/systems/timesystem';
import ThreeSystem from './ecs/systems/threesystem';
import MoveSystem from './ecs/systems/movesystem';
import ControlSystem from './ecs/systems/controlsystem';
import WeaponSystem from './ecs/systems/weaponsystem';
import CollisionSystem from './ecs/systems/collisionsystem';
import ParticlesSystem from './ecs/systems/particlessystem';

import MiniConsole from './miniconsole';
import ThreeScene from './threescene';
import { World } from "ape-ecs";
import EntityFactory from './ecs/entityfactory';

class App {
    constructor() {
        new MiniConsole();
        this.lastTime = 0;
        this.ts = new ThreeScene();
        this.ecs = new World();
        EntityFactory.init(this.ecs);

        // components
        this.ecs.registerComponent(GameLoop);
        this.ecs.registerComponent(Destroy);
        this.ecs.registerComponent(DeleteTimer);
        this.ecs.registerComponent(ThreeComponent);
        this.ecs.registerComponent(ScreenShake);
        this.ecs.registerComponent(MoveAlongRing);
        this.ecs.registerComponent(Move);
        this.ecs.registerComponent(Weapon);
        this.ecs.registerComponent(Collider);
        this.ecs.registerComponent(TargetColor);
        this.ecs.registerComponent(Trail);

        // tags
        this.ecs.registerTags(
            'UpdateShader',
            'Controllable', 'CameraTarget',
            'Bullet', 'Enemy', 'Particle',
            'Explodes'
        );

        // systems // TODO possible d'utiliser new XXXSystem(xxx, yyy)
        this.ecs.registerSystem('frame', TimeSystem);
        this.ecs.registerSystem('frame', ControlSystem);
        this.ecs.registerSystem('frame', WeaponSystem);
        this.ecs.registerSystem('frame', ParticlesSystem, [this.ts]);
        this.ecs.registerSystem('frame', MoveSystem);
        this.ecs.registerSystem('frame', CollisionSystem);
        this.ecs.registerSystem('frame', ThreeSystem, [this.ts]);

        // create entities
        EntityFactory.createGameLoop();
        EntityFactory.createPlanet();
        EntityFactory.createRings();
        EntityFactory.createBackground();
        EntityFactory.createPlayer();
        EntityFactory.createTestEnemy();

        this.resize();
        addEventListener('resize', () => this.resize(), false);
        requestAnimationFrame((t) => this.update(t));
    }

    update(time) {
        time = 0.001 * time;
        let delta = (time - this.lastTime);
        delta = Math.min(delta, 0.1);
        this.lastTime = time;
        this.ecs.getEntity('game').getOne('GameLoop').update({ time, delta })

        this.ecs.runSystems('frame');
        this.ecs.tick();
        this.render(time, delta);
        requestAnimationFrame((t) => this.update(t));
    }

    render(time, delta) {
        this.ts.render(time, delta);
    }

    resize() {
        this.ts.resize();
    }
}

// starts all!
window.addEventListener('DOMContentLoaded', () => new App())
