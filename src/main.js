import DeleteTimer from './ecs/components/deletetimer';
import TimeSystem from './ecs/systems/timesystem';
import MiniConsole from './miniconsole';
import ThreeScene from './threescene';
import { World } from "ape-ecs";

class App {
    constructor() {
        new MiniConsole();
        this.lastTime = 0;
        this.ts = new ThreeScene();
        this.ecs = new World();
        this.ecs.registerComponent(DeleteTimer);
        this.ecs.registerSystem('frame', TimeSystem)

        this.ecs.createEntity(
            {id: 'test', c: {
                time: {
                type:'DeleteTimer', 
                time_left:120
            }}})

        this.resize()
        addEventListener('resize', () => this.resize(), false);
        requestAnimationFrame((t) => this.update(t));
    }

    update(time) {
        time = 0.001 * time;
        let delta = (time - this.lastTime);
        delta = Math.min(delta, 0.1);
        this.lastTime = time;
        
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
