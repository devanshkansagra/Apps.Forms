import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { SurveysApp } from "../../SurveysApp";
import { getCredentials } from "../helpers/getCredentials";
import { OAuthURL } from "../enums/OAuthSettingEnum";
import { AuthPersistence } from "../persistence/authPersistence";

export class SDK {
    constructor(
        private readonly http: IHttp,
        private readonly app: SurveysApp,
    ) {}
    public authPersistence = new AuthPersistence(this.app as SurveysApp);
    public async createToken(
        read: IRead,
        code: string,
        http: IHttp,
        user: IUser,
        persis: IPersistence,
    ): Promise<any> {
        const accessToken = await this.app?.oAuth2ClientInstance.getAccessTokenForUser(user)
        console.log(accessToken);
    }

    public async createForm(formData: any) {

    }
}
