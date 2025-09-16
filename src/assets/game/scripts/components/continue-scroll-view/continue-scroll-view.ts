import { _decorator, find, ScrollView, v2 } from "cc";
const { ccclass, property } = _decorator;

@ccclass
export class ContinueScrollView extends ScrollView {

    @property()
    outSideScrollViewPath: string = "";

    private outSideScrollView: ScrollView = null;

    onLoad(): void {
        if (!this.outSideScrollViewPath){
            console.error("outSideScrollViewPath is not set");
            return;
        } 
        this.outSideScrollView = find(this.outSideScrollViewPath).getComponent(ScrollView);
        this.node.on(ScrollView.EventType.SCROLLING, this.onScrolling, this);
    }

    onScrolling(): void {
        const maxOffset = this.getMaxScrollOffset();
        const currentOffset = this.getScrollOffset();

        const outSideScrollOffset = this.outSideScrollView.getScrollOffset();
        let offSetToScroll = 0;
        let outSideOffsetToScroll = 0;
        if (currentOffset.y > maxOffset.y) {
            offSetToScroll = currentOffset.y - maxOffset.y;
            outSideOffsetToScroll = outSideScrollOffset.y + offSetToScroll;
            this.outSideScrollView.scrollToOffset(v2(0, outSideOffsetToScroll), 0.5);
        } else if (currentOffset.y < 0) {
            
            offSetToScroll = Math.abs(currentOffset.y - 0);
            outSideOffsetToScroll = outSideScrollOffset.y - offSetToScroll;
            this.outSideScrollView.scrollToOffset(v2(0, outSideOffsetToScroll), 0.5);
        }
    }
}
