import { Component } from "ape-ecs";

export default class Collider extends Component {
  static properties = {
    radius:10,
    against: null,
    checked: false
  }
}
