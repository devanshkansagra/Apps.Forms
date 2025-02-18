import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
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
import { AddQuestionModal } from "../modals/AddQuestionModal";

export class ExecuteBlockActionHandler {
    private context: UIKitBlockInteractionContext;
    constructor(
        protected readonly app: SurveysApp,
        context: UIKitBlockInteractionContext,
        protected readonly read: IRead,
        protected readonly http: IHttp,
        protected readonly persistence: IPersistence,
        protected readonly modify: IModify,
    ) {
        this.context = context;
    }

    public async execute(): Promise<IUIKitResponse> {
        const { actionId, triggerId, user } = this.context.getInteractionData();

        try {
            switch (actionId) {
                case ElementEnum.ADD_Question_ACTION: {
                    const modal = await AddQuestionModal({
                        read: this.read,
                        http: this.http,
                        persis: this.persistence,
                        modify: this.modify,
                        id: this.app.getID(),
                    });

                    if (triggerId) {
                        await this.modify
                            .getUiController()
                            .openSurfaceView(modal, { triggerId }, user);
                    }
                    break;
                }
                default: {
                    console.log("Default executed");
                }
            }
        } catch (error) {}
        return {
            success: true,
        };
    }
}
