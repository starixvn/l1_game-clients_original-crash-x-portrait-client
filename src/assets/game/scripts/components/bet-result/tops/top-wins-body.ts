import { _decorator, CCInteger, instantiate, Node, Prefab, UITransform } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { TopResultClient, TopWinItem } from "../../../handlers/api-client/top-result-client";
import { TopWinHandlers } from "../../../handlers/crash-v2";
import { TopWinStore } from "../../../handlers/crash-v2/bet/top-win-store";
import TopWinsBodyItem from "./top-wins-body-item";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass("TopWinsBody")
export class TopWinsBody extends ObserverComponent {

    @property({ type: Node })
    content: Node = null;

    @property({ type: Prefab })
    itemPrefab: Prefab = null;

    @property({ type: CCInteger, tooltip: "0: Monthly, 1: Yearly" })
    periodType = 0;

    private currentIndex = 0;
    private itemHeight = 0;
    protected topResultClient: TopResultClient = new TopResultClient();

    async fetchData() {
        const topWinItems: TopWinItem[] = [];
        return topWinItems;
    }

    @render(TopWinStore, (store) => store.topWinItems, { fireImmediately: false })
    async bindContent(topWinItems: TopWinItem[]) {
        if(!topWinItems || topWinItems.length === 0) {
            return;
        }

        topWinItems.forEach((data, rowIndex) => {
            const item = this.buildBodyRow(this.itemPrefab, rowIndex, data);
            this.content.addChild(item);

            const currentPosition = item.getPosition();
            const y = -this.itemHeight / 2 - this.currentIndex * this.itemHeight;
            item.setPosition(currentPosition.x, y);
            this.currentIndex++;
        });

        this.content.getComponent(UITransform).height = this.currentIndex * this.itemHeight;
    }

    getHistoryItemComponent(node: Node) {
        return node.getComponent(TopWinsBodyItem);
    }

    buildBodyRow(bodyItemPrefab: Prefab, index: number, data: TopWinItem): Node {
        const bodyItem = instantiate(bodyItemPrefab);
        this.getHistoryItemComponent(bodyItem)?.setData(index, data);
        return bodyItem;
    }

    @handle(TopWinHandlers, (handle, periodType: number) => handle.getTopWinByType(periodType))
    getTopWinItems() {
        return this.periodType;
    }

    onLoad() {
        this.itemHeight = this.itemPrefab.data.getComponent(UITransform).height;
        super.onLoad();
        this.getTopWinItems();
    }
}
