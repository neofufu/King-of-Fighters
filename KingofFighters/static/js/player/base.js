import { game_objects } from '/static/js/game_object/base.js';

class Player extends game_objects {
    constructor(root, info) {
        super();

        this.root = root;
        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;

        this.direction = 1;

        this.vx = 0;
        this.vy = 0;

        this.speedx = 400;  // 水平速度
        this.speedy = -1000;  // 跳起的初始速度 

        this.gravity = 50;

        this.ctx = this.root.game_map.ctx;

        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        this.status = 3;  // 0: idle, 1: 向前，2：向后，3：跳跃，4：攻击，5：被打，6：死亡
        //初始为3，从空中跳下
        this.animations = new Map();//存动作
        this.frame_current_cnt = 0; //每过一帧 记录一下

        this.hp = 100;
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`); //血条
        this.$hp_div = this.$hp.find('div');
    }

    start() {

    }

    update_control() {
        let w, a, d, space;
        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        } else {
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }

        //console.log(this.pressed_keys);

        if (this.status === 0 || this.status === 1) {
            if (space) {
                this.status = 4;
                this.vx = 0;
                this.frame_current_cnt = 0; //从头开始播放动画
            } else if (w) {
                if (d) {
                    this.vx = this.speedx;
                } else if (a) {
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0;
                }
                this.vy = this.speedy;
                this.status = 3;
                this.frame_current_cnt = 0; //从头开始播放动画
            } else if (d) {
                this.vx = this.speedx;
                this.status = 1;
            } else if (a) {
                this.vx = -this.speedx;
                this.status = 1;
            } else {
                this.vx = 0;
                this.status = 0;
            }
        } //控制逻辑
    }

    update_move() {
        if (this.status === 3) {
            this.vy += this.gravity;
        }

        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        if (this.y > 450) {

            this.y = 450;
            this.vy = 0;
            this.status = 0; //把状态变成 0
        }

        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        } //给定边界
    }

    update_direction() {
        if (this.status === 6) return;

        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) me.direction = 1;
            else me.direction = -1;
        }
    }

    is_attack() {
        if (this.status === 6) return;

        this.status = 5;
        this.frame_current_cnt = 0;

        this.hp = Math.max(this.hp - 20, 0);

        this.$hp_div.animate({
            width: this.$hp.parent().width() * this.hp / 100
        }, 300);
        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp / 100
        }, 600); //血条动画

        if (this.hp <= 0) {
            this.status = 6;
            this.frame_current_cnt = 0;
        }
    }

    is_collision(r1, r2) {
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2))
            return false;
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2))
            return false;
        return true;
    }

    update_attack() {
        if (this.status === 4 && this.frame_current_cnt === 18) {
            let me = this, you = this.root.players[1 - this.id];
            let r1;
            if (this.direction > 0) {
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 120 + 100,
                    y2: me.y + 40 + 20,
                };
            } else {
                r1 = {
                    x1: me.x + me.width - 120 - 100,
                    y1: me.y + 40,
                    x2: me.x + me.width - 120 - 100 + 100,
                    y2: me.y + 40 + 20,
                };
            }

            let r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height
            };

            if (this.is_collision(r1, r2)) {
                you.is_attack();
            }
        }
    }

    update() {
        this.update_control();
        this.update_move();
        this.update_direction();
        this.update_attack();

        this.render();
    }

    render() {
        // this.ctx.fillStyle = 'red';
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);   //确定攻击边界

        // if (this.direction > 0) {  //for update_attack function
        //     this.ctx.fillStyle = 'blue';
        //     this.ctx.fillRect(this.x + 120, this.y + 40, 100, 20);
        // } else {
        //     this.ctx.fillStyle = 'blue';
        //     this.ctx.fillRect(this.x + this.width - 220, this.y + 40, 100, 20);
        // }

        let status = this.status;

        if (this.status === 1 && this.direction * this.vx < 0) status = 2; //前进

        let obj = this.animations.get(status);
        if (obj && obj.loaded) {
            if (this.direction > 0) {
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            } else {
                this.ctx.save(); //保持配置
                this.ctx.scale(-1, 1);
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0);

                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);

                this.ctx.restore(); //再把坐标系变回来 
            }
        }

        if (status === 4 || status === 5 || status === 6) {
            if (this.frame_current_cnt == obj.frame_rate * (obj.frame_cnt - 1))//播放完帧数
            {
                if (status === 6) {
                    this.frame_current_cnt--;
                } else {
                    this.status = 0;
                }
            }
        }

        this.frame_current_cnt++;
    }
}

export {
    Player
}