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
        const { view, user, triggerId, threadId } = this.context.getInteractionData();
        const questionPersistence = new QuestionPersistence(this.persistence, this.read.getPersistenceReader());
        try {
            switch(view.id) {
                case ModalEnum.CREATE_FORM_VIEW: {
                    console.log(view);
                    await questionPersistence.deleteQuestionBlocks(this.app.getID());
                }
            }
        }
        catch(error) {}

        return {
            success: true,
        };
    }
}
