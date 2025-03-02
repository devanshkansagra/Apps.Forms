import {
    IHttp,
    IHttpResponse,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { SurveysApp } from "../../SurveysApp";
import { getCredentials } from "../helpers/getCredentials";
import { OAuthURL } from "../enums/OAuthSettingEnum";
import { AuthPersistence } from "../persistence/authPersistence";
import { ElementEnum } from "../enums/ElementEnum";
import { IAuthData } from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";

export class SDK {
    constructor(
        private readonly http: IHttp,
        private readonly app: SurveysApp,
    ) {}
    public authPersistence = new AuthPersistence(this.app as SurveysApp);
    public async getAccessToken(
        read: IRead,
        code: string,
        user: IUser,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IAuthData> {
        const { clientId, clientSecret } = await getCredentials(read);
        const redirectURL = OAuthURL.REDIRECT_URL;

        const response = await http.post(
            "https://oauth2.googleapis.com/token",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                content: `code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectURL}&grant_type=authorization_code`,
            },
        );
        let accessToken:IAuthData = {
            expiresAt: response.data?.expires_in,
            token: response.data?.access_token,
            refreshToken: response.data?.refresh_token,
            scope: response.data?.scope,
        }

        await this.authPersistence.setAccessTokenForUser(accessToken, user, persis)
        return accessToken
    }

    public async createGoogleForm(formData: any, user: IUser, read: IRead) {
        const token = await this.authPersistence.getAccessTokenForUser(user, read);
        const accessToken = token.token;

        const formTitle = formData[ElementEnum.FORM_TITLE_ACTION];

        const createFormResponse = await this.http.post(
            "https://forms.googleapis.com/v1/forms",
            {
                headers: {
                    Authorization: `Bearer ${accessToken.token}`,
                    "Content-Type": "application/json",
                },
                content: JSON.stringify({
                    info: {
                        title: formTitle,
                    },
                }),
            },
        );

        if(!createFormResponse.statusCode.toString().startsWith('2')) {
            console.log("Create Form error: " + createFormResponse);
            return;
        }

        const createdForm = createFormResponse
        const formId = createdForm.data?.formId;

        const requests: any[] = [];

        const formDescription = formData[ElementEnum.FORM_DESCRIPTION_ACTION];
        requests.push({
            updateFormInfo: {
                info: {
                    description: formDescription,
                },
                updateMask: "description",
            },
        });

        const questionTextKeys = Object.keys(formData).filter(
            (key) =>
                key.startsWith(ElementEnum.QUESTION_ACTION) &&
                !key.includes(ElementEnum.QUESTION_TYPE_ACTION),
        );
        const questionTypeKeys = Object.keys(formData).filter((key) =>
            key.startsWith(ElementEnum.QUESTION_TYPE_ACTION),
        );

        if (questionTextKeys.length !== questionTypeKeys.length) {
            return;
        }
        questionTextKeys.forEach((questionTextKey, index) => {
            const questionText = formData[questionTextKey];
            const questionType = formData[questionTypeKeys[index]];

            let questionItem: any;
            if (questionType === "short-answer") {
                questionItem = {
                    createItem: {
                        item: {
                            title: questionText,
                            questionItem: {
                                question: {
                                    textQuestion: {
                                        paragraph: false,
                                    },
                                },
                            },
                        },
                        location: {
                            index: index,
                        },
                    },
                };
            } else if (questionType === "paragraph") {
                questionItem = {
                    createItem: {
                        item: {
                            title: questionText,
                            questionItem: {
                                question: {
                                    textQuestion: {
                                        paragraph: true,
                                    },
                                },
                            },
                        },
                        location: {
                            index: index,
                        },
                    },
                };
            }

            if (questionItem) {
                requests.push(questionItem);
            }
        });

        const batchUpdateResponse: IHttpResponse = await this.http.post(
            `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken.token}`,
                    "Content-Type": "application/json",
                },
                content: JSON.stringify({
                    requests: requests,
                }),
            },
        );
        if (!batchUpdateResponse.statusCode.toString().startsWith('2')) {
            console.log("BatchUpdate Error:", batchUpdateResponse);
            return;
        }

        return createdForm;
    }
}
