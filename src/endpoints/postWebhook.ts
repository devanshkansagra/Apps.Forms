import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from "@rocket.chat/apps-engine/definition/api"
import { SurveysApp } from "../../SurveysApp";
import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";

export class PostWebhookEndpoint extends ApiEndpoint {

    public path: string = "webhook"
    constructor(public readonly app: SurveysApp) {
        super(app);
    }

    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ):Promise<IApiResponse> {

        console.log(request);
        return {
            status: 200,
        }
    }
}
