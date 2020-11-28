import MiniConsole from './miniconsole';
import ThreeScene from './threescene';
import TouchController from './touchcontroller';


class App {
    constructor() {
        new MiniConsole();
        this.lastTime = 0;
        this.ts = new ThreeScene();
        this.controller = new TouchController();

        this.resize()
        addEventListener('resize', () => this.resize(), false);
        requestAnimationFrame((t) => this.update(t));
    }

    update(time) {
        let delta = (time - this.lastTime) * 0.001;
        delta = Math.min(delta, 0.1);
        this.lastTime = time;
      
        // TODO 
        // XXXX

        this.render(time, delta);
        requestAnimationFrame((t) => this.update(t));
    }

    render(time, delta) {
        this.ts.render(time, delta);
        if(this.controller) this.controller.display();
    }

    resize() {
        this.ts.resize();
    }
}

// starts all!
window.addEventListener('DOMContentLoaded', () => new App())
