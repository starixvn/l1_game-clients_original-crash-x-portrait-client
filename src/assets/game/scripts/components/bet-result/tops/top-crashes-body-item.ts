import gc from "@sg/game-client-base";
import { _decorator, Label, Node } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { TopCrashItem } from "../../../handlers/api-client/top-result-client";
import { TopCrashHandlers } from "../../../handlers/crash-v2";

const { property, ccclass } = _decorator;
const { DateTimeUtils, FormatUtils } = gc;
const { handle } = Observer;

@ccclass
export default class TopCrashesBodyItem extends ObserverComponent {
    @property(Label)
    lblDate: Label = null;

    @property(Label)
    lblRound: Label = null;

    @property(Node)
    nodeBackground: Node = null;

    @property(Label)
    lblResult: Label = null;

    private roundId: number;

    setData(index: number, item: TopCrashItem) {
        this.nodeBackground.active = index % 2 > 0;
        this.lblDate && (this.lblDate.string = DateTimeUtils.getStringDateByTime(item.time));
        this.lblRound.string = item.provablyFair?.roundId?.toString();
        this.lblResult.string = `${FormatUtils.numberWithCommas(+item.result, 2, false)}x`;
        this.roundId = item.provablyFair?.roundId;
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSoundClick() {
        return gc.Audios.AudioIds.CLICK;
    }

    @handle(TopCrashHandlers, (handle, roundId: number) => handle.openVerificationHistory(roundId))
    onClickVerify() {
        this.playSoundClick();
        return this.roundId;
    }
}
