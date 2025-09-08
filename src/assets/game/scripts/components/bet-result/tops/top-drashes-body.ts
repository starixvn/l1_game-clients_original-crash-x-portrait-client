import { _decorator, CCInteger, instantiate, Node, Prefab, UITransform } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { TopCrashItem } from "../../../handlers/api-client/top-result-client";
import { TopCrashStore } from "../../../handlers/crash-v2/bet/top-crash-store";
import { TopCrashHandlers } from "../../../handlers/crash-v2/handlers/top-crash-handlers";
import TopCrashesBodyItem from "./top-crashes-body-item";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass("TopDrashesBody")
export class TopDrashesBody extends ObserverComponent {
    @property({ type: Node })
    content: Node = null;

    @property({ type: Prefab })
    itemPrefab: Prefab = null;

    @property({ type: CCInteger, tooltip: "0: Monthly, 1: Yearly" })
    periodType = 0;

    private currentIndex = 0;
    private itemHeight = 0;

    @render(TopCrashStore, (store) => store.topCrashItems, { fireImmediately: false })
    bindContent(topCrashItems: TopCrashItem[]) {
        if(!topCrashItems || topCrashItems.length === 0) {
            return;
        }

        topCrashItems.forEach((data, rowIndex) => {
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
        return node.getComponent(TopCrashesBodyItem);
    }

    buildBodyRow(bodyItemPrefab: Prefab, index: number, data: TopCrashItem): Node {
        const bodyItem = instantiate(bodyItemPrefab);
        this.getHistoryItemComponent(bodyItem)?.setData(index, data);
        return bodyItem;
    }

    @handle(TopCrashHandlers, (handle, periodType: number) => handle.getTopCrashByType(periodType))
    getTopCrashItems() {
        return this.periodType;
    }

    onLoad() {
        this.itemHeight = this.itemPrefab.data.getComponent(UITransform).height;
        super.onLoad();

        this.getTopCrashItems();
    }
}
