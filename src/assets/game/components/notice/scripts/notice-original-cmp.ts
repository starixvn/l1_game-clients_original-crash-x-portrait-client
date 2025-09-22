import { _decorator } from "cc";
const { ccclass } = _decorator;

import gc from "@sg/game-client-base";
import { NoticeDirectCmp } from "db://direct-shared-components/notice/scripts/notice-direct-cmp";
import { NoticeType } from "db://shared-components/shared/common-components/notice/scripts/notice-cmp";

const { AppTypes } = gc;

@ccclass()
export class NoticeOriginalCmp extends NoticeDirectCmp {
    setData(data: {
        title: string;
        message: string;
        type: NoticeType;
        onClose: () => void;
        showBtnConfirmButton?: boolean;
        noticeInfo?: gc.Notices.NoticeInfo;
    }) {
        if (this.appType === AppTypes.Original) {
            this.setDirectData(data);
        }
    }
}
