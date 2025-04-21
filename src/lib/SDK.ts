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
import { OAuthSetting, OAuthURL } from "../enums/OAuthSettingEnum";
import { AuthPersistence } from "../persistence/authPersistence";
import { ElementEnum } from "../enums/ElementEnum";
import { IAuthData } from "@rocket.chat/apps-engine/definition/oauth2/IOAuth2";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { sendNotification } from "../helpers/message";
import { isModalView } from "@rocket.chat/ui-kit";

export class SDK {
    constructor(
        private readonly http: IHttp,
        private readonly app: SurveysApp
    ) {}
    public authPersistence = new AuthPersistence(this.app as SurveysApp);
    public async getAccessToken(
        read: IRead,
        code: string,
        user: IUser,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IAuthData> {
        const { clientId, clientSecret } = await getCredentials(read);
        const redirectURL = OAuthURL.REDIRECT_URL;

        const room = (await read.getRoomReader().getById("GENERAL")) as IRoom;

        const response = await http.post(OAuthURL.ACCESSS_TOKEN_URI, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            content: `code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectURL}&grant_type=authorization_code`,
        });

        let accessToken: any = {};
        if (response) {
            accessToken = {
                expiresAt: response.data?.expires_in,
                token: response.data?.access_token,
                refreshToken: response.data?.refresh_token,
                scope: response.data?.scope,
            };

            await sendNotification(
                read,
                modify,
                user,
                room,
                "Login successful 🚀"
            );

            await this.authPersistence.setAccessTokenForUser(
                accessToken,
                user,
                persis
            );
        }
        return accessToken;
    }

    public async refreshAccessToken(
        user: IUser,
        read: IRead,
        refreshToken: string,
        persis: IPersistence
    ) {
        const { clientId, clientSecret } = await getCredentials(read);
        const response = await this.http.post(OAuthURL.REFRESH_TOKEN_URI, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            content: `client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`,
        });
        if (response.statusCode.toString().startsWith("2")) {
            const newAccessToken = {
                token: response.data?.access_token,
                expiresAt: response.data?.expires_in,
                refreshToken: refreshToken,
                scope: response.data?.scope,
            };

            await this.authPersistence.setAccessTokenForUser(newAccessToken, user, persis);
        }
    }

    public async revokeAccessToken(
        read: IRead,
        modify: IModify,
        user: IUser,
        room: IRoom,
        persistence: IPersistence
    ) {
        const token = await this.authPersistence.getAccessTokenForUser(
            user,
            read
        );
        if (!token) {
            await sendNotification(
                read,
                modify,
                user,
                room,
                "You are already logged out"
            );
        } else {
            const access_token = token.token;

            const response = await this.http.post(
                "https://oauth2.googleapis.com/revoke",
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    content: `token=${access_token.token}`,
                }
            );

            if (response.statusCode.toString().startsWith("2")) {
                await this.authPersistence.deleteAccessTokenForUser(
                    user,
                    persistence
                );
                await sendNotification(
                    read,
                    modify,
                    user,
                    room,
                    "Logged out successfully"
                );
            }
        }
    }

    public async createGoogleForm(formData: any, user: IUser, read: IRead) {
        const token = await this.authPersistence.getAccessTokenForUser(
            user,
            read
        );
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
            }
        );

        if (!createFormResponse.statusCode.toString().startsWith("2")) {
            console.log(
                "Create Form error: " + JSON.stringify(createFormResponse)
            );
            return;
        }

        const createdForm = createFormResponse;
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
                !key.includes(ElementEnum.QUESTION_TYPE_ACTION)
        );
        const questionTypeKeys = Object.keys(formData).filter((key) =>
            key.startsWith(ElementEnum.QUESTION_TYPE_ACTION)
        );

        if (questionTextKeys.length !== questionTypeKeys.length) {
            return;
        }
        questionTextKeys.forEach((questionTextKey, index) => {
            const questionText = formData[questionTextKey];
            const questionType = formData[questionTypeKeys[index]];
            const questionOptions = [];

            let questionItem: any;
            if (questionType === "TEXT") {
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
            } else if (questionType === "PARAGRAPH") {
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
            } else if (questionType === "RADIO") {
                questionItem = {
                    createItem: {
                        item: {
                            title: questionText,
                            questionItem: {
                                question: {
                                    choiceQuestion: {
                                        type: 'radio',
                                        options: [
                                            {value: 'option1'},
                                            {value: 'option2'},
                                            {value: 'option3'}
                                        ]
                                    }
                                }
                            }
                        },
                        location: {
                            index: index
                        }
                    }
                }
            } else if(questionType === "CHECKBOX") {
                questionItem = {
                    createItem: {
                        item: {
                            title: questionText,
                            questionItem: {
                                question: {
                                    choiceQuestion: {
                                        type: 'checkbox',
                                        options: [
                                            {value: 'option1'},
                                            {value: 'option2'},
                                            {value: 'option3'}
                                        ]
                                    }
                                }
                            }
                        },
                        location: {
                            index: index
                        }
                    }
                }
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
            }
        );
        if (!batchUpdateResponse.statusCode.toString().startsWith("2")) {
            console.log("BatchUpdate Error:", batchUpdateResponse);
            return;
        }
        return createdForm;
    }
    public async getFormResponses(
        formId: string,
        accessToken: string
    ): Promise<IHttpResponse> {
        let responses;
        try {
            responses = await this.http.get(
                `https://forms.googleapis.com/v1/forms/${formId}/responses`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.log(error);
        }
        return responses as IHttpResponse;
    }

    public async getFormData(
        formId: string,
        user: IUser,
        read: IRead,
        accessToken: string
    ): Promise<IHttpResponse> {
        let formData;
        try {
            formData = await this.http.get(
                `https://forms.googleapis.com/v1/forms/${formId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.log(error);
        }

        return formData as IHttpResponse;
    }

    public async createAIForms(
        app: SurveysApp,
        read: IRead,
        modify: IModify,
        user: IUser,
        room: IRoom,
        persis: IPersistence,
        prompt: string
    ): Promise<void> {
        const { APIKey } = await getCredentials(read);

        const formStructure = `
             {
                info: {
                    title: string; // Title of the form
                    description: string // Description of form
                };
                items: Array<{
                    title: string; // Title of the question
                    type: string; // (e.g., TEXT, MULTIPLE_CHOICE, PARAGAPH, CHECKBOX)
                    required: boolean; // Whether the field is mandatory
                    options?: Array<{
                        value: string; // Option value (only for MULTIPLE_CHOICE or CHECKBOX type)
                    }>;
                }>;
            }
        `;
        let finalPrompt =
            `Respond with only a valid, minified JSON object (in text form only with no extra text) for creating a Google Form. The JSON should follow strictly follow this structure ${formStructure} . If the prompt provided to you is strictly not in context of creating a google form then send an error text which says 'This prompt is invalid, I can only assist with creating google form'". Here's the Prompt: ` +
            prompt;
        const response = await this.http.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APIKey}`,
            {
                content: JSON.stringify({
                    contents: [
                        { role: "user", parts: [{ text: finalPrompt }] },
                    ],
                }),
            }
        );

        const input = response.data.candidates[0].content.parts[0].text;
        console.log(input);
    }
}
