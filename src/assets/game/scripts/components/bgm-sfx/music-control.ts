import { _decorator } from "cc";
import Observer from "observer";

import { ObserverComponent } from "../../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";
import { BGMSFXHandlers } from "../../handlers/bgm-sfx/bgm-sfx-handlers";
import { OPEN_BGMSFXCONTROL } from "../../handlers/bgm-sfx/bgm-sfx-store";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass("MusicControl")
export class MusicControl extends ObserverComponent {
    @handle(BGMSFXHandlers, (handle) => handle.handle({ event: OPEN_BGMSFXCONTROL }))
    openMusicControl() {}
}
