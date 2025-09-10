import gc from "@sg/game-client-base";
import { _decorator, instantiate, Prefab } from "cc";
import Observer from "observer";

import { BetDetailTable } from "db://shared-components/game/bet-history/scripts/components/bet-detail/bet-detail-table";
import { CrashxBetDetailSummary } from "./crashx-bet-detail-summary";
const { handle } = Observer;
const { ccclass, property } = _decorator;

export type BetDetailTableType = {
    model: gc.BetHistory.BetDetailModel;
    resultContentPrefab: Prefab;
    betDetailSummaryPrefab: Prefab;
    betDetailLogTablePrefab: Prefab;
    logDetailItemPrefab: Prefab;
};

@ccclass()
export class CrashxBetDetail extends BetDetailTable {
    showBetDetail(data: BetDetailTableType) {
        super.showBetDetail(data);
        const { model, betDetailSummaryPrefab } = data;

        const betDetailSummaryTable = instantiate(betDetailSummaryPrefab);
        const summaryComponent = betDetailSummaryTable?.getComponent(CrashxBetDetailSummary);
        summaryComponent?.renderResult(model);


        this.nodeBetDetailSummaryTable?.addChild(betDetailSummaryTable);
    }


}
