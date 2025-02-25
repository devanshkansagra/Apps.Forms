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

export class SDK {
    constructor(
        private readonly http: IHttp,
    ) {}

    public async createToken(
        read: IRead,
        code: string,
        http: IHttp,
        user: IUser,
        persis: IPersistence,
    ): Promise<any> {
        //
        const clientId = '672627846978-qlihaphkd93gv1jogp827kl54iqkrati.apps.googleusercontent.com';
        const clientSecret = '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';
        const redirectURL = 'http://localhost:3000/api/apps/public/d6588a9f-0f27-4e6e-8975-e6cc380f0cab/google-cloud-callback'
        // const serverSettings = await accessors.environmentReader.getServerSettings();
        // console.log(serverSettings);
        const response = await http.post(
            "https://oauth2.googleapis.com/token",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                content: `code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectURL}&grant_type=authorization_code`,
            },
        );
        return response;
    }
}
