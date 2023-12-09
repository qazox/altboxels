/*
    Code for handling events.
*/

function GameEvent(type, target, data, canvas) {
    this.type = type;
    this.data = data;
    this.canvas = canvas;
    this.target = target;

    for (let interaction of target.interactions) {
        if (interaction(this)) return this;
    }
}