import { Component } from "ape-ecs";

export class Destroy extends Component {
  static properties = {}
}

export class DeleteTimer extends Component {
  static properties = {
    time_left: 1
  }
}