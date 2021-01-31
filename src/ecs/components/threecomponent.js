import { Component } from "ape-ecs";

export class ThreeComponent extends Component{
    static properties = {
        mesh: null,
        position: null,
        rotation: null
    }
}

export class ScreenShake extends Component {
    static properties = {
        power: 10,
        duration: 0.1
    }
}

export class TweenColor extends Component {
    static properties = {
        start: null,
        end: null,
        time: 0,
        duration: 1
    }
}