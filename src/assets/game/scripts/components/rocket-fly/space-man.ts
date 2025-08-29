import { _decorator, Component, tween, v3 } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export class SpaceMan extends Component {
    defaultPosX: number;

    walk() {
        this.resetPosition();
        this.setSpaceManVisibility(true);
        tween(this.node)
            .to(2, { position: v3(0, 0, 0) })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    setSpaceManVisibility(status: boolean) {
        this.node.active = status;
    }

    resetPosition() {
        this.node.position = v3(this.defaultPosX, 0, 0);
    }
}
