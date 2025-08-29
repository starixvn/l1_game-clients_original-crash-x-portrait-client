import gc from "@sg/game-client-base";
import { _decorator, instantiate, Prefab } from "cc";
import Observer from "observer";

import { ObserverComponent } from "../../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";
import { SpaceMan } from "./space-man";

const { ccclass, property } = _decorator;
const { handle, render } = Observer;

@ccclass
export class SpaceManList extends ObserverComponent {
    @property(Prefab)
    prfSpaceMan: Prefab = null;

    @property
    spaceManNumber = 3;

    @property
    spaceManDistance = 40;

    private readonly firstSpaceManPosX = 120;
    private readonly walkedSound = "walking_man";

    onLoad() {
        super.onLoad();
        this.initSpaceManList();
    }

    setVisibility(status: boolean) {
        this.node.active = status;

        if (status) {
            this.playSoundWalkingMan();
            this.node.getComponentsInChildren(SpaceMan).forEach((spaceMan) => {
                spaceMan.walk();
            });
        }
    }

    initSpaceManList() {
        this.node.destroyAllChildren();
        for (let i = 0; i < this.spaceManNumber; i++) {
            const spaceManNode = instantiate(this.prfSpaceMan);
            this.node.addChild(spaceManNode);
            const spaceManComp = spaceManNode.getComponent(SpaceMan);
            const posX = this.firstSpaceManPosX + i * this.spaceManDistance;
            spaceManComp.defaultPosX = posX;
        }
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSoundWalkingMan() {
        return this.walkedSound;
    }
}
