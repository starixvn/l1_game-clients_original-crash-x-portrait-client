import gc from "@sg/game-client-base";
import { _decorator, Label } from "cc";
import Observer from "observer";

import { BaseBetDetailSummaryTable } from "db://shared-components/game/bet-history/scripts/components/bet-detail/bet-detail-summary-table";

const { ccclass, property } = _decorator;
const { FormatUtils, GameCrash } = gc;
const { handle } = Observer;

@ccclass()
export class CrashxBetDetailSummary extends BaseBetDetailSummaryTable {
    @property(Label)
    lblRound: Label = null;

    @property(Label)
    lblCrashPoint: Label = null;

    betHistoryLog: gc.BetHistory.BetHistoryLog = null;

    private roundId: number;

    renderResult(model: gc.BetHistory.BetDetailModel) {
        const { roundId, result } = model.betHistoryLog;
        this.roundId = roundId;
        this.betHistoryLog = model.betHistoryLog;
        console.log("renderResult", this.betHistoryLog);
        this.lblRound.string = roundId.toString();
        this.lblCrashPoint.string = `${FormatUtils.numberWithCommas(+result, 2, false)}x`;
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSoundClick() {
        return gc.Audios.AudioIds.CLICK;
    }

    @handle(gc.RoundBasePF.ProvablyFairHandler, (handle, roundId: number) => handle.openVerificationHistory(roundId))
    onClickVerify() {
        this.playSoundClick();
        console.log("onClickVerify", this.roundId);
        return this.roundId;
    }
}
