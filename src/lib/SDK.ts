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
import { ElementEnum } from "../enums/ElementEnum";

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
    ): Promise<void> {
        const clientId =
            "672627846978-qlihaphkd93gv1jogp827kl54iqkrati.apps.googleusercontent.com";
        const clientSecret = "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";
        const redirectURL =
            "http://localhost:3000/api/apps/public/d6588a9f-0f27-4e6e-8975-e6cc380f0cab/google-cloud-callback";

        const response = await http.post(
            "https://oauth2.googleapis.com/token",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                content: `code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectURL}&grant_type=authorization_code`,
            },
        );

        console.log(response);
    }

    public async createGoogleForm(formData: any) {
        const accessToken =
            "ya29.a0AeXRPp4sWaGO4bwkRhxdW0waE0Y7cI4R5YzLkk8QcH0y3Jnku5czKYdkfVZcUBSqfQ7CD3nvuzJGaWDSIpHSwq_aHH7UidHLzb9xZOwyoGq9pCLgZKJC08S6EwbOxieNukuSh5dMAVCypTJjWNTp4rM8hfTglqDc6HhmGCHDaCgYKAUsSARMSFQHGX2MiX4PGJvbbl0fC64UphsNgsg0175";

        const formTitle = formData[ElementEnum.FORM_TITLE_ACTION];

        // Create the form with just the title
        const createFormResponse = await fetch(
            "https://forms.googleapis.com/v1/forms?key=AIzaSyA2EsTaRGEOGWlljx_RM5y18NxxoFOsluY",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    info: {
                        title: formTitle,
                    },
                }),
            },
        );

        if (!createFormResponse.ok) {
            console.log(createFormResponse);
            const errorResponse = await createFormResponse.json();
            console.log("Create Form Error:", errorResponse);
            return;
        }

        const createdForm = await createFormResponse.json();
        const formId = createdForm.formId;

        // Prepare the requests to add description and questions
        const requests: any[] = [];

        // Add form description
        const formDescription = formData[ElementEnum.FORM_DESCRIPTION_ACTION];
        requests.push({
            updateFormInfo: {
                info: {
                    description: formDescription,
                },
                updateMask: "description",
            },
        });

        // Iterate over the formData and pair questionText with questionType
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

        const batchUpdateResponse = await fetch(
            `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate?key=AIzaSyA2EsTaRGEOGWlljx_RM5y18NxxoFOsluY`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    requests: requests,
                }),
            },
        );

        if (!batchUpdateResponse.ok) {
            const errorResponse = await batchUpdateResponse.json();
            console.log("BatchUpdate Error:", errorResponse);
            return;
        }

        return createdForm;
    }
}
