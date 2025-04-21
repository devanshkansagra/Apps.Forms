import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { SurveysApp } from "../../SurveysApp";
import {
    IUIKitResponse,
    UIKitInteractionContext,
    UIKitViewCloseInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { ModalEnum } from "../enums/ModalEnum";
import { QuestionPersistence } from "../persistence/questionPersistence";
import { deleteForms } from "./FormHandler";

export class ExecuteViewClosedHandler {
    constructor(
        protected readonly app: SurveysApp,
        protected readonly read: IRead,
        protected readonly http: IHttp,
        protected readonly persistence: IPersistence,
        protected readonly modify: IModify,
    ) {}

    public async execute(context: UIKitViewCloseInteractionContext): Promise<IUIKitResponse> {
        const { view } = context.getInteractionData();
        const questionPersistence = new QuestionPersistence(this.persistence, this.read.getPersistenceReader());
        switch(view.id) {
            case ModalEnum.CREATE_FORM_VIEW : {
                await questionPersistence.deleteQuestionBlocks(this.app.getID());
                break;
            }
            default: {
                console.log("Default is executed in closed handler");
            }
        }
        return { success: true } as any;
    }
}
