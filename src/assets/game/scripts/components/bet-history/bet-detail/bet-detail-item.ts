import gc from "@sg/game-client-base";
import { _decorator, Color, Label, Node } from "cc";
import Observer from "observer";

import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";

import { CrashUtils } from "../../../crash-utils";

const { property, ccclass } = _decorator;
const { FormatUtils } = gc;
const { handle } = Observer;

export type BetResultHistoryBodyItemType = {
    betHistoryLog: gc.BetHistory.BetHistoryLog;
    index: number;
    betKey: number;
    fractionalOddsFormat?: boolean;
};

@ccclass
export default class BetDetailItem extends ObserverComponent {
    @property(Label)
    lblTime: Label = null;

    @property(Label)
    lblMultiplier: Label = null;

    @property(Label)
    lblBet: Label = null;

    @property(Label)
    lblWin: Label = null;

    @property(Node)
    nodeBackground: Node = null;

    betHistoryLog: gc.BetHistory.BetHistoryLog = null;

    setData(data: BetResultHistoryBodyItemType) {
        const { betHistoryLog, index } = data;
        this.betHistoryLog = betHistoryLog;
        this.nodeBackground.active = index % 2 > 0;
        this.setLabels(betHistoryLog);
    }

    private setLabels(betHistoryLog: gc.BetHistory.BetHistoryLog) {
        this.lblTime.string = CrashUtils.formatTime(betHistoryLog.time);
        this.lblWin.string = FormatUtils.numberWithCommas(betHistoryLog.betwin, 2);
        if (betHistoryLog.betwin > 0) {
            this.lblWin.color = new Color().fromHEX("FFF600");
        }
    }
}
