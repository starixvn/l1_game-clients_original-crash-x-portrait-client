import gc from "@sg/game-client-base";
import { _decorator, Color, Component, Label, Prefab } from "cc";
import { reverse } from "lodash-es";

import { ReachMaxWin } from "db://shared-components/game-crash/bet-history-details/scripts/reach-max-win";
import { DynamicObject } from "@sg/game-client-base/dist/game/bet-history/bet-history-store";
import { CrashGameBetDetailLogTable } from "db://shared-components/game-crash/bet-history-details/scripts/crash-game-bet-detail-log-table";
const { FormatUtils } = gc;

const { ccclass, property } = _decorator;
interface IBetDetailLog {
    amount: number;
    winAmount: number;
    multiplier: number | null;
    time: string | null;
    action: string;
}

@ccclass
export class CrashxBetDetailTable extends CrashGameBetDetailLogTable {
    @property(ReachMaxWin)
    cpnReachMaxWin: ReachMaxWin = null;

    @property(Label)
    lblTotalStake: Label = null;

    @property(Label)
    lblWin: Label = null;

    @property(Label)
    lblWinLoss: Label = null;

    @property(Component)
    verificationHandler: Component = null;

    betHistoryLog: gc.BetHistory.BetHistoryLog = null;

    isBetRowData(betDetail: DynamicObject<object>, betKey: string): boolean {
        const actionName = betDetail.action.toString();
        return actionName === gc.GameClientEmitMessage.Bet.eventName.toString() && betDetail.betKey.toString() === betKey;
    }
    private getTotalAmountFromBetLogDetails(betHistoryLog: gc.BetHistory.BetHistoryLog): number {
        return betHistoryLog.betLogDetails
            .filter((element) => this.isBetRowData(element, element.betKey.toString()))
            .reduce((total, betDetail) => total + Number(betDetail.amount), 0);
    }

    showBetDetail(bodyItemPrefab: Prefab, model: gc.BetHistory.BetDetailModel) {
        const { fractionalOddsFormat, betHistoryLog } = model;
        const { result, settlementResult, odds, freeBet, betLogDetails } = betHistoryLog;
        this.betHistoryLog = betHistoryLog;
        const reversedLogs = reverse([...betLogDetails]);

        this.cpnReachMaxWin?.setData(reversedLogs);
        const totalAmount = this.getTotalAmountFromBetLogDetails(betHistoryLog);
        const winLoss = betHistoryLog.betwin - totalAmount;
        this.lblTotalStake.string = FormatUtils.numberWithCommas(totalAmount, 2);
        this.lblWinLoss.string = FormatUtils.numberWithCommas(winLoss, 2);
        this.lblWin.string = FormatUtils.numberWithCommas(betHistoryLog.betwin, 2)

        if (betHistoryLog.betwin > 0) {
            this.lblWin.color = new Color().fromHEX("FFF600");
            this.lblWinLoss.color = new Color().fromHEX("FFF600");
        }

        reversedLogs.forEach((betDetailsLog, index) => {
            this.body.addChild(
                this.buildBodyRow(bodyItemPrefab, {
                    betDetailsLog,
                    index,
                    odds,
                    settlementResult,
                    result,
                    freeBet,
                    fractionalOddsFormat,
                })
            );
        });
    }
}
