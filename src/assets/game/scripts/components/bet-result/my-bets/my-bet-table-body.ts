import gc from "@sg/game-client-base";
import { _decorator, Button, instantiate, Node, Prefab, ScrollView, UITransform, Vec3 } from "cc";
import Observer from "observer";

import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { MyBetModel, MyBetStore } from "../../../handlers/crash-v2/bet/rocketx-bet-history-store";
import { BetHistoryRocketXHandlers, HistoryConstants } from "../../../handlers/crash-v2/handlers/bet-history-handlers";
import BetResultHistoryBodyItem from "../../bet-history/bet-history-rocketx-table-body-row";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass("MyBetTableBody")
export class MyBetTableBody extends ObserverComponent {
    @property({ type: Node })
    content: Node = null;

    @property({ type: Prefab })
    itemPrefab: Prefab = null;

    @property({ type: Node })
    reachMaxWinNode: Node = null;

    private readonly tooltipPositionX: number = 230;
    private readonly tooltipPositionYBuffer: number = 48;
    private startYPosition: number;
    private itemHeight: number;
    private readonly pageSize: number = HistoryConstants.pageSizeMyHistory;

    private currentPageIndex: number = 1;
    private currentIndex: number = 0;
    private isFetchingData: boolean = false;
    private isNodataToFetch: boolean = false;

    private getHistoryItemComponent(node: Node): BetResultHistoryBodyItem {
        return node.getComponent(BetResultHistoryBodyItem);
    }

    private buildBodyRow(
        bodyItemPrefab: Prefab,
        betHistoryLog: gc.BetHistory.BetHistoryLog,
        index: number,
        betKey: number,
        fractionalOddsFormat: boolean = false
    ): Node {
        const bodyItem = instantiate(bodyItemPrefab);
        const component = this.getHistoryItemComponent(bodyItem);

        component?.setData({
            betHistoryLog,
            index,
            betKey,
            fractionalOddsFormat,
        });

        this.setupHoverEvents(bodyItem);
        return bodyItem;
    }

    private setupHoverEvents(bodyItem: Node): void {
        bodyItem.on(HistoryConstants.hoverTriggerParent, this.onHoverMaxReachTrigger, this);
        bodyItem.on(HistoryConstants.exitHoverTriggerParent, this.onExitHoverMaxReachTrigger, this);
    }

    private onHoverMaxReachTrigger(childNode: Node): void {
        const tooltipButton = this.reachMaxWinNode.getComponent(Button);
        const position = childNode.getPosition();
        const positionY = this.content.getPosition().y + position.y - this.tooltipPositionYBuffer;

        tooltipButton.node.setPosition(new Vec3(this.tooltipPositionX, positionY, 0));
        tooltipButton.node.active = true;
    }

    private onExitHoverMaxReachTrigger(): void {
        const tooltipButton = this.reachMaxWinNode.getComponent(Button);
        tooltipButton.node.active = false;
    }

    @handle(BetHistoryRocketXHandlers.BetHistoryRocketXCallServiceHandler, (handler, pageNumber: number) =>
        handler.getMyHistory(pageNumber, HistoryConstants.pageSizeMyHistory, HistoryConstants.mybet)
    )
    private fetchData(): number {
        return this.currentPageIndex;
    }

    @render(MyBetStore, (store) => store.myBetModel, { fireImmediately: false })
    private showMyBet(myBetModel: MyBetModel): void {
        this.renderData(myBetModel);
    }

    private renderData(myBetModel: MyBetModel): void {
        myBetModel.betLogs.forEach((betLogItem, rowIndex) => {
           // this.processBetLogDetails(betLogItem, rowIndex);
           this.processBetHistory(betLogItem, rowIndex);
        });

        this.updateUIAfterRender(myBetModel);
    }

    private processBetLogDetails(betLogItem: any, rowIndex: number): void {
        betLogItem.betLogDetails.forEach((betLogDetail: any) => {
            if (betLogDetail.action.toString() === gc.GameClientEmitMessage.Bet.eventName.toString()) {
                this.createAndPositionBetItem(betLogItem, rowIndex, betLogDetail);
            }
        });
    }

    private processBetHistory(betHistoryLog: gc.BetHistory.BetHistoryLog, rowIndex: number): void {
        console.log("betHistoryLog", betHistoryLog.betwin, betHistoryLog.roundId);
        const item = this.buildBodyRow(this.itemPrefab, betHistoryLog, rowIndex, Number(betHistoryLog.betwin));
        this.content.addChild(item);
        const currentPosition = item.getPosition();
        const y = this.startYPosition - this.currentIndex * this.itemHeight;

        item.setPosition(currentPosition.x, y);
        this.currentIndex++;
    }

    private createAndPositionBetItem(betLogItem: any, rowIndex: number, betLogDetail: any): void {
        const item = this.buildBodyRow(this.itemPrefab, betLogItem, rowIndex, Number(betLogDetail.betKey));
        this.content.addChild(item);

        const currentPosition = item.getPosition();
        const y = this.startYPosition - this.currentIndex * this.itemHeight;

        item.setPosition(currentPosition.x, y);
        this.currentIndex++;
    }

    private updateUIAfterRender(myBetModel: MyBetModel): void {
        if (myBetModel.betLogs.length < this.pageSize) {
            this.isNodataToFetch = true;
        }

        this.content.getComponent(UITransform).height = this.currentIndex * this.itemHeight;
        this.isFetchingData = false;
    }

    onLoad() {
        this.itemHeight = this.itemPrefab?.data.getComponent(UITransform).height || 0;
        this.startYPosition = -this.itemHeight / 2;
        super.onLoad();
        this.fetchData();
        this.setupScrollListener();
    }

    private setupScrollListener() {
        this.node.on(ScrollView.EventType.SCROLL_TO_BOTTOM, this.onScrolling, this);
    }

    private onScrolling() {
        if (!this.isNodataToFetch && !this.isFetchingData) {
            this.currentPageIndex++;
            this.isFetchingData = true;
            this.fetchData();
        }
    }

    onDestroy() {
        if (this.node) {
            this.node.off(ScrollView.EventType.SCROLL_TO_BOTTOM, this.onScrolling, this);
        }
    }
}
