import { game_objects } from '/static/js/game_object/base.js';
import { Controller } from '/static/js/controller/base.js';

class GameMap extends game_objects {
    constructor(root) {
        super();

        this.root = root;
        this.$canvas = $('<canvas width="1280" height="720" tabindex=0></canvas>');
        this.ctx = this.$canvas[0].getContext('2d');
        this.root.$kof.append(this.$canvas);
        this.$canvas.focus();

        this.controller = new Controller(this.$canvas);
    }

    start() {

    }

    update() { //不更新的话会存下轨迹：画线
        this.render();
    }

    render() {
        // this.ctx.fillStyle = "orange"; //不刷新留下路径 test
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}

export {
    GameMap
}