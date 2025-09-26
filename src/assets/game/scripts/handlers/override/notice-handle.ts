import gc from "@sg/game-client-base";
import inversify from "inversify";
import { CrashBetHandler } from "./crash-bet-handler";
const { injectable, inject } = inversify;
@injectable()
export class NoticeHandlers extends gc.Notices.NoticeHandlers {
    @inject(CrashBetHandler) private readonly newCrashBetHandler: CrashBetHandler;

    handleNotice(notice: gc.GameServiceMessage.Notice) {
        super.handleNotice(notice);
        if (notice.errorCode === "SB1911") {
            this.newCrashBetHandler.turnOffAutoBet();
        }
    }
}
