import gc from "@sg/game-client-base";
import inversify from "inversify";
import { siteConfigs } from "../../../../scripts/site-configs";
import { settings } from "../../game-settings";
import ApiClient from "./api-client";
import { APISettings } from "./api-settings";

const { UrlUtils } = gc;
const { injectable } = inversify;

@injectable()
export class TopResultClient {
    private readonly apiClient: ApiClient;

    constructor() {
        const path = UrlUtils.getSubDirectory(siteConfigs.subDirectory);
        const baseURL = UrlUtils.buildUrl("http", `/${path}` , siteConfigs);
        this.apiClient = new ApiClient(baseURL);
    }


    async getTopCrashMonthly() {
        return this.apiClient.get<TopCrashItem[]>(APISettings.TopCrashMonthly.url + settings.id);
    }

    async getTopCrashYearly() {
        return this.apiClient.get<TopCrashItem[]>(APISettings.TopCrashYearly.url + settings.id);
    }

    async getTopWinMonthly() {
        return this.apiClient.get<TopWinItem[]>(APISettings.TopWinMonthly.url + settings.id);
    }

    async getTopWinYearly() {
        return this.apiClient.get<TopWinItem[]>(APISettings.TopWinYearly.url + settings.id);
    }
}

export interface ProvablyFair {
    clientSeeds: Array<{
        name: string;
        clientSeed: string;
      }>;
    time: string;
    roundId: number;
    serverSeedHash: string;
    serverSeed: string;
    __v: number;
    finalHash: string;
    mergeClientSeed: string;
    mergeSeed: string;
}

export interface TopCrashItem {
    id: number;
    result: number;
    time: string;
    provablyFair: ProvablyFair;
}

export interface TopWinItem {
    cashoutPoint: number;
    crashPoint: number;
    uid: string;
    name: string;
    operatorId: string;
    currency: string;
    time: string;
    roundId: number;
    betAmount: number;
    winAmount: number;
    provablyFair: ProvablyFair;
    rate: number;
}
