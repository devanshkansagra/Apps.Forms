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

        try {
            const questionPersistence = new QuestionPersistence(
                this.persistence,
                this.read.getPersistenceReader(),
            );

            const questionBlocks = await questionPersistence.getQuestionBlocks(
                this.app.getID(),
            );

            // Process the state to extract the form data
            const formData = {};
            for (const blockId in state) {
                if (state.hasOwnProperty(blockId)) {
                    const block = state[blockId];
                    for (const actionId in block) {
                        if (block.hasOwnProperty(actionId)) {
                            formData[actionId] = block[actionId];
                            console.log("BlockId: " + blockId);
                            console.log("ActionId: " + actionId);
                        }
                    }
                }
            }

            // Create Google Form
            await this.createGoogleForm(formData);

            // Clear the question blocks after form submission
            await questionPersistence.saveQuestionBlocks(this.app.getID(), []);
        } catch (error) {
            console.warn("ExecuteViewSubmitHandler Error:", error);
        }

        return {
            success: true,
        };
    }

    private async createGoogleForm(formData: any) {
        const accessToken =
            "ya29.a0AeXRPp5F9pys-fEgDeR3fM819RpNjJqPVd9qOR98HqI8HEcfVBg0s5TOYM8V8x6EXs43fOLiffBatq3u-AnIuoJRORzAeGhmT2rWv8IWkqI3pkfmWM1_P0gwczLnxqeDInXxvaGSQmE-EWJYDt6gvNxOSjxg7JuLnlxFl_3daCgYKAWkSARMSFQHGX2MinZRxv2Nvk9DjVL1CBT4VBA0175";

        const formTitle = formData[ElementEnum.FORM_TITLE_ACTION];
        const formDescription = formData[ElementEnum.FORM_DESCRIPTION_ACTION];

        // Create the form with just the title
        const createFormResponse = await fetch(
            "https://forms.googleapis.com/v1/forms",
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
        }

        const createdForm = await createFormResponse.json();
        const formId = createdForm.formId;

        // Prepare the requests to add questions
        const requests: any[] = [];

        for (const actionId in formData) {
            if (actionId.startsWith(ElementEnum.QUESTION_ACTION)) {
                const questionText = formData[actionId];
                const questionType = formData[actionId.replace(ElementEnum.QUESTION_ACTION, ElementEnum.QUESTION_TYPE_ACTION)];
                console.log(questionText);

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
                                index: -1,
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
                                index: -1,
                            },
                        },
                    };
                }

                if (questionItem) {
                    requests.push(questionItem);
                }
            }
        }

        // Debugging: Log the requests array
        console.log('Requests:', requests);

        // Use batchUpdate to add questions to the form
        const batchUpdateResponse = await fetch(
            `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
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
            console.log(batchUpdateResponse);
        }

        const updatedForm = await batchUpdateResponse.json();
        console.log("Form updated:", updatedForm);
    }
}
