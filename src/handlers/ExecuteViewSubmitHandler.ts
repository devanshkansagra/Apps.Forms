import {
    IUIKitResponse,
    UIKitViewSubmitInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { SurveysApp } from "../../SurveysApp";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { ElementEnum } from "../enums/ElementEnum";
import { QuestionPersistence } from "../persistence/questionPersistence";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { sendNotification } from "../helpers/message";
import { ModalEnum } from "../enums/ModalEnum";

export class ExecuteViewSubmitHandler {
    private context: UIKitViewSubmitInteractionContext;

    constructor(
        protected readonly app: SurveysApp,
        context: UIKitViewSubmitInteractionContext,
        protected readonly read: IRead,
        protected readonly http: IHttp,
        protected readonly persistence: IPersistence,
        protected readonly modify: IModify,
    ) {
        this.context = context;
    }

    public async execute(): Promise<IUIKitResponse> {
        const { view, user } = this.context.getInteractionData();
        const { state } = view;
        const room = (await this.read.getRoomReader().getById('GENERAL')) as IRoom;
        const questionPersistence = new QuestionPersistence(
            this.persistence,
            this.read.getPersistenceReader(),
        );

        const questionBlocks = await questionPersistence.getQuestionBlocks(
            this.app.getID(),
        );

        try {
            switch (view.id) {
                case ModalEnum.CREATE_FORM_VIEW: {
                    // Process the state to extract the form data
                    const formData = {};
                    for (const blockId in state) {
                        if (state.hasOwnProperty(blockId)) {
                            const block = state[blockId];
                            for (const actionId in block) {
                                if (block.hasOwnProperty(actionId)) {
                                    formData[actionId] = block[actionId];
                                }
                            }
                        }
                    }

                    console.log("FormData:", formData);

                    const res = await this.createGoogleForm(formData);

                    await sendNotification(this.read, this.modify, user, room, "New Google Form Created: " + res.responderUri);

                    await questionPersistence.deleteQuestionBlocks(
                        this.app.getID(),
                    );
                }
            }
        } catch (error) {
            console.log(error);
        }
        return {
            success: true,
        };
    }

    private async createGoogleForm(formData: any) {
        const accessToken =
            "ya29.a0AeXRPp7IB50DgEYBxKZ02lVvF6vSXbskA3K-M45_scyDKhtUUupLmNRkW6NKw1W3J9dAtiQNFUpbn1cmzVdPB40L75nBLFFkGvbk_YJwMp6V_AHQG9ix7lCgQ3H3nTzdL0NW4_rOmee1lFssvnsUSPe15TfAMdIOpDdY4P4HaCgYKAZQSARMSFQHGX2MiyaeqwT0l7MkKpX8aZNna9w0175";

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

        console.log("Question Text Keys:", questionTextKeys);
        console.log("Question Type Keys:", questionTypeKeys);

        if (questionTextKeys.length !== questionTypeKeys.length) {
            console.error("Mismatch between question texts and question types");
            console.log("Question Text Keys:", questionTextKeys);
            console.log("Question Type Keys:", questionTypeKeys);
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

        // Debugging: Log the requests array
        console.log("Requests:", JSON.stringify(requests));
        console.log("FormId: " + formId);
        // Use batchUpdate to add description and questions to the form
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
