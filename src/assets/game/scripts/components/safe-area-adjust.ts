import { _decorator, Component, SafeArea, Color, UIOpacity } from 'cc';
const { ccclass } = _decorator;

@ccclass('SafeAreaDebug')
export class SafeAreaDebug extends Component {
    start() {
        const safe = this.getComponent(SafeArea);
        if (safe) {
            // Hiển thị màu debug để dễ thấy
            this.node.addComponent(UIOpacity).opacity = 120;
            this.node.getComponent(UIOpacity);
            this.node.getComponent(UIOpacity);
            this.node.getComponent(UIOpacity);

            this.node.getComponent(UIOpacity).opacity = 120;
            (this.node as any).color = new Color(100, 200, 255, 120);
        }
    }
}