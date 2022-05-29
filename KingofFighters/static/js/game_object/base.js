let GAME_OBJECTS = [];

class game_objects {
    constructor() {
        GAME_OBJECTS.push(this);

        this.timedelta = 0; //当前这一帧和上一帧的时间间隔
        this.has_call_start = false; //当前对象有没有执行过 
    }

    start() {    //初始执行一次

    }

    update() {   //每一帧执行一次

    }

    destroy() {     //删除当前对象
        for (let i in GAME_OBJECTS) {
            if (GAME_OBJECTS[i] === this) {
                GAME_OBJECTS.splice(i, 1);// 删除当前元素
                break;
            }
        }
    }
}

let last_timestamp;

let GAME_OBJECTS_FRAME = (timestamp) => {
    for (let obj of GAME_OBJECTS) {
        if (!obj.has_call_start) {
            obj.start();
            obj.has_call_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;

    requestAnimationFrame(GAME_OBJECTS_FRAME);
}

requestAnimationFrame(GAME_OBJECTS_FRAME); //jQuery函数

export {
    game_objects
}