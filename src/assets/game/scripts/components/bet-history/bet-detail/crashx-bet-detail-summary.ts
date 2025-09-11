import gc from "@sg/game-client-base";
import { _decorator, Label } from "cc";

import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";

const { ccclass, property } = _decorator;
const { FormatUtils } = gc;

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


}
