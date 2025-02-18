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
        const { view, user, triggerId, threadId } = this.context.getInteractionData();
        try {
            switch(view.id) {
                case ModalEnum.CREATE_FORM_VIEW: {
                    console.log(view);
                }
                case ModalEnum.ADD_QUESTION_VIEW: {
                    const questionTitle = view.state?.[ElementEnum.QUESTION_TITLE_BLOCK]?.[ElementEnum.QUESTION_TITLE_ACTION];
                    const questionType = view.state?.[ElementEnum.QUESTION_TYPE_BLOCK]?.[ElementEnum.QUESTION_TYPE_ACTION];

                    if(questionType === 'Short Answer') {
                        let questionBlock: LayoutBlock = {
                            type: 'input',
                            label: {
                                type: TextTypes.PLAIN_TEXT,
                                text: questionTitle,
                            },
                            element: {
                                type: 'plain_text_input',
                                initialValue: questionType,
                                blockId: ElementEnum.QUESTION_BLOCK,
                                actionId: ElementEnum.QUESTION_ACTION,
                                appId: this.app.getID(),
                            }
                        }

                        const modal = await CreateFormModal({
                            read: this.read,
                            modify: this.modify,
                            http: this.http,
                            persis: this.persistence,
                            threadId: threadId,
                            triggerId: triggerId,
                            id: this.app.getID(),
                            questionElement: [questionBlock],
                        })

                        if(triggerId) {
                            return this.modify.getUiController().openSurfaceView(modal, {triggerId}, user)
                        }
                    }
                }
            }
        }
        catch(error) {}

        return {
            success: true,
        };
    }
}
