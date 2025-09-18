import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import Observer from "observer";
import { NodeContainer } from "../../../../../extensions/shared-components/assets/shared/common-components/node-container/node-container";
import { BGMSFXStore, EventData, OPEN_BGMSFXCONTROL } from "../../handlers/bgm-sfx/bgm-sfx-store";

const { render, handle } = Observer;
const { ccclass } = _decorator;

@ccclass("BGMSFXControlContainer")
export class BGMSFXControlContainer extends NodeContainer {
    @render(BGMSFXStore, (store) => store.event, { fireImmediately: false })
    openBGMSFXControl(event: EventData) {
        if (event.event === OPEN_BGMSFXCONTROL) {
            this.openDialog();
        }
    }

    protected openDialog() {
        this.createNode();
    }

    @render(gc.Dialogs.DialogsStore, (store) => store.forceClosed, { fireImmediately: false })
    popupVisibility(forceClosed: any) {
        forceClosed && this.node.destroyAllChildren();
    }
}
