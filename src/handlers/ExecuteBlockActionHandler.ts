import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
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
import { LayoutBlock } from "@rocket.chat/ui-kit";
import { TextTypes } from "../enums/TextTypes";

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
        const { actionId, triggerId, user, value } =
            this.context.getInteractionData();

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
                case ElementEnum.QUESTION_TYPE_ACTION: {
                    if (value === "Multiple Choice") {
                        const optionsBlock: LayoutBlock = {
                            type: "input",
                            label: {
                                type: TextTypes.PLAIN_TEXT,
                                text: "Add Options*",
                            },
                            element: {
                                type: "plain_text_input",
                                placeholder: {
                                    type: TextTypes.PLAIN_TEXT,
                                    text: "Option1, Option2,....",
                                },
                                blockId: ElementEnum.OPTIONS_BLOCK,
                                actionId: ElementEnum.OPTIONS_ACTION,
                                appId: this.app.getID(),
                            },
                        };
                        if (triggerId) {
                            const modal = await AddQuestionModal({
                                read: this.read,
                                http: this.http,
                                persis: this.persistence,
                                modify: this.modify,
                                id: this.app.getID(),
                                optionBlock: optionsBlock,
                            });

                            await this.modify
                                .getUiController()
                                .updateSurfaceView(modal, { triggerId }, user);
                        }
                    } else {
                        if (triggerId) {
                            const modal = await AddQuestionModal({
                                read: this.read,
                                http: this.http,
                                persis: this.persistence,
                                modify: this.modify,
                                id: this.app.getID(),
                            });

                            await this.modify
                                .getUiController()
                                .updateSurfaceView(modal, { triggerId }, user);
                        }
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
