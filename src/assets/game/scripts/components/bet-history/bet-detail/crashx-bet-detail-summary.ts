import gc from "@sg/game-client-base";
import { _decorator, Label } from "cc";
import Observer from "observer";

import { BaseBetDetailSummaryTable } from "db://shared-components/game/bet-history/scripts/components/bet-detail/bet-detail-summary-table";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";

const { ccclass, property } = _decorator;
const { FormatUtils, GameCrash } = gc;
const { handle } = Observer;

@ccclass()
export class CrashxBetDetailSummary extends ObserverComponent {
    @property(Label)
    lblRound: Label = null;

    @property(Label)
    lblCrashPoint: Label = null;

    betHistoryLog: gc.BetHistory.BetHistoryLog = null;

    renderResult(model: gc.BetHistory.BetDetailModel) {
        const { roundId, result } = model.betHistoryLog;
        this.betHistoryLog = model.betHistoryLog;
        this.lblRound.string = roundId.toString();
        this.lblCrashPoint.string = `${FormatUtils.numberWithCommas(+result, 2, false)}x`;
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSoundClick() {
        return gc.Audios.AudioIds.CLICK;
    }

    @handle(gc.GameCrash.ProvablyFair.ProvablyFairHandler, (handle, roundId: number) => {
        console.log("Handler called with roundId:", roundId);
        return handle.openVerificationHistory(roundId);
    })
    onClickVerify() {
        this.playSoundClick();
        console.log("onClickVerify called, roundId:", this.betHistoryLog.roundId);
        return this.betHistoryLog.roundId;
    }
}
