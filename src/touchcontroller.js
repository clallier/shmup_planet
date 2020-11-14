import { Vector2 } from "three";

export default class TouchController {
    constructor() {
        this.state = {
            dir: new Vector2(),
            // action btn
            action: false
        };

        this.keys = {
            left: 37,
            right: 39,
            up: 38,
            down: 40,
            space: 32
        };

        this.colors = {
            background: 'rgba(64, 213, 142, 0.2)',
            outline: 'rgba(255, 255, 255, 0.5)',
            joystick: 'rgba(255, 0, 255, 0.3)'
        }

        this.canvas = document.createElement('canvas');

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // TODO resize 
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.canvas.style.position = 'absolute';
        this.canvas.style.zIndex = 2;

        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');


        this.r = Math.max(this.width / 20, 50);
        this.show = true;
        let v0 = new Vector2(this.r * 2, this.height - this.r * 2);
        let v1 = new Vector2(this.width - this.r * 2, this.height - this.r * 2);
        this.leftTouchID = 0; // -1
        this.rightTouchID = 0; // -1
        this.leftTouchPos = v0.clone();
        this.leftTouchStartPos = v0.clone();
        this.rightTouchPos = v1.clone();


        this.canvas.addEventListener('touchstart', (e) => this.touchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.touchEnd(e));
        this.canvas.addEventListener('touchmove', (e) => this.touchMove(e));

        document.addEventListener('keydown', (e) => this.keyDownListener(e), true);
        document.addEventListener('keyup', (e) => this.keyUpListener(e), true);
    }

    touchStart(event) {
        event.preventDefault();

        if (this.show === true) {
            this.show = false;
            this.leftTouchId = -1;
            this.rightTouchId = -1;
        }

        this.show = true;
        for (let i = 0; i < event.changedTouches.length; i += 1) {
            const t = event.changedTouches[i];

            // TODO cleanup
            if (this.leftTouchId < 0 && t.clientX < this.width) {
                this.leftTouchId = t.identifier;
                this.leftTouchStartPos.x = this.leftTouchPos.x = t.clientX;
                this.leftTouchStartPos.y = this.leftTouchPos.y = t.clientY;
                this.state.dir.x = this.state.dir.y = 0;
                continue;
            } else if (this.rightTouchId < 0) {
                this.rightTouchId = t.identifier;
                this.rightTouchPos.x = t.clientX;
                this.rightTouchPos.y = t.clientY;
                this.state.action = true;
                continue;
            }
        }
    }


    touchMove(event) {
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i += 1) {
            const t = event.changedTouches[i];
            if (this.leftTouchId === t.identifier) {
                this.state.dir.x = (t.clientX - this.leftTouchStartPos.x) / this.r;
                this.state.dir.y = (t.clientY - this.leftTouchStartPos.y) / this.r;
                this.state.dir.clampLength(0, 1);
                this.leftTouchPos.x = this.leftTouchStartPos.x + this.state.dir.x * this.r;
                this.leftTouchPos.y = this.leftTouchStartPos.y + this.state.dir.y * this.r;
                continue;
            } else if (this.rightTouchId === t.identifier) {
                this.rightTouchPos.x = t.clientX;
                this.rightTouchPos.y = t.clientY;
                this.state.action = true;
                continue;
            }
        }
    }

    touchEnd(event) {
        event.preventDefault();
        this.show = false;
        for (let i = 0; i < event.changedTouches.length; i += 1) {
            const t = event.changedTouches[i];

            if (this.leftTouchId === t.identifier) {
                this.leftTouchId = -1;
                this.state.dir.x = 0;
                this.state.dir.y = 0;
                break;
            }
            if (this.rightTouchId === t.identifier) {
                this.rightTouchId = -1;
                this.state.action = false;
                break;
            }
        }
    }

    keyDownListener(event) {
        this.show = false;
        if (event.defaultPrevented) {
            return; // Should do nothing if the key event was already consumed.
        }
        if (event.keyCode === this.keys.up) {
            this.state.dir.y = -1;
        }
        if (event.keyCode === this.keys.down) {
            this.state.dir.y = 1;
        }
        if (event.keyCode === this.keys.left) {
            this.state.dir.x = -1;
        }
        if (event.keyCode === this.keys.right) {
            this.state.dir.x = 1;
        }
        if (event.keyCode === this.keys.space) {
            this.state.action = true;
        }
        event.preventDefault();
    }

    keyUpListener(event) {
        if (event.defaultPrevented) {
            return; // Should do nothing if the key event was already consumed.
        }
        if (event.keyCode === this.keys.up || event.keyCode === this.keys.down) {
            this.state.dir.y = 0;
        }
        if (event.keyCode === this.keys.left || event.keyCode === this.keys.right) {
            this.state.dir.x = 0;
        }
        if (event.keyCode === this.keys.space) {
            this.state.action = false;
        }
        event.preventDefault();
    }

    display () {
        this.ctx.clearRect(0, 0, this.width, this.height);
        if(this.show == false) return;
        
        const PI2 = 2 * Math.PI;
        if (this.leftTouchID > -1) {
            this.ctx.strokeStyle = this.colors.outline;
            this.ctx.fillStyle = this.colors.background;
            this.ctx.lineWidth = 8;
            this.ctx.beginPath();
            this.ctx.arc(this.leftTouchStartPos.x, this.leftTouchStartPos.y, this.r, 0, PI2);
            this.ctx.stroke();
            this.ctx.closePath();

            this.ctx.strokeStyle = this.colors.outline;
            this.ctx.fillStyle = this.colors.joystick;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.leftTouchPos.x, this.leftTouchPos.y, this.r * 0.9, 0, PI2);
            this.ctx.stroke();
            this.ctx.fill();
            this.ctx.closePath();
        }

        // if (this.rightTouchID > -1) {
        //     this.ctx.strokeStyle = this.color;
        //     this.ctx.fillStyle = '#ddd';
        //     this.ctx.beginPath();
        //     this.ctx.arc(this.rightTouchPos.x, this.rightTouchPos.y, this.r * 0.9, 0, PI2);
        //     this.ctx.stroke();
        //     this.ctx.closePath();
        // }
    }
}