import { Component } from "ape-ecs";

export default class GameLoop extends Component {
    static properties = {
        // in s
        delta: 0, 
        // in s
        time: 0
    }
}