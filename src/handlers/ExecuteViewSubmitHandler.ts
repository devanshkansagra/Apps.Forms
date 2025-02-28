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
import { ModalEnum } from "../enums/ModalEnum";
import { ElementEnum } from "../enums/ElementEnum";
import { LayoutBlock } from "@rocket.chat/ui-kit";
import { TextTypes } from "../enums/TextTypes";
import { CreateFormModal } from "../modals/CreateFormModal";
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

    public async execute(): Promise<void | IUIKitResponse> {
        const { view, user, triggerId, threadId } =
            this.context.getInteractionData();
        const questionPersistence = new QuestionPersistence(
            this.persistence,
            this.read.getPersistenceReader(),
        );
        try {
            switch (view.id) {
                case ModalEnum.CREATE_FORM_VIEW: {
                    console.log(view);
                    const formTitle =
                        view.state?.[ElementEnum.FORM_TITLE_BLOCK]?.[
                            ElementEnum.FORM_TITLE_ACTION
                        ];
                    const formDescription =
                        view.state?.[ElementEnum.FORM_DESCRIPTION_BLOCK]?.[
                            ElementEnum.FORM_DESCRIPTION_ACTION
                        ];

                    const formData = {
                        info: {
                            title: formTitle,
                            documentTitle: formDescription
                        },
                    };

                    // const response = await this.http.post(
                    //     "https://forms.googleapis.com/v1/forms",
                    //     {
                    //         headers: {
                    //             Authorization: `Bearer ya29.a0AeXRPp5o_o1E35qWxjkAogS2s5DcwcW6jPLIQUEuYiaurLEUds93GYM49oA0Wo6egFgXDINa1UPS9468i2UgOUczGhsId41J482lve6ojQ5BdBU5bxnNZ8M-r2E7cyakCSCruLz1_bGgAYVBKaJif9VwYc3bbqde7I6H-WYraCgYKASUSARMSFQHGX2MimZyRsjbEAgC2vMbnO2lmdQ0175`,
                    //             "Content-Type": "application/json",
                    //         },
                    //         data: formData,
                    //     },
                    // );

                    // console.log(response);

                    await questionPersistence.deleteQuestionBlocks(
                        this.app.getID(),
                    );
                }
            }
        } catch (error) {}

        return {
            success: true,
        };
    }
}
