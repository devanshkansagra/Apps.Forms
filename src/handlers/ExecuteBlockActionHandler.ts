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
import { CreateFormModal } from "../modals/CreateFormModal";
import { QuestionPersistence } from "../persistence/questionPersistence";

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
        const { actionId, triggerId, user, value, threadId } =
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
                    const questionPersistence = new QuestionPersistence(
                        this.persistence,
                        this.read.getPersistenceReader(),
                    );
                    const questionBlocks =
                        await questionPersistence.getQuestionBlocks(
                            this.app.getID(),
                        );

                    if (value === "Short Answer") {
                        let block: LayoutBlock;
                        block = {
                            type: "input",
                            label: {
                                text: value + " Question",
                                type: TextTypes.PLAIN_TEXT,
                            },
                            element: {
                                type: "plain_text_input",
                                placeholder: {
                                    type: TextTypes.PLAIN_TEXT,
                                    text: "Enter question for short answers",
                                },
                                blockId: value+"Block",
                                actionId: value+"Action",
                                appId: this.app.getID(),
                            },
                        };
                        questionBlocks.push(block);
                    } else if (value === "Paragraph") {
                        let block: LayoutBlock;
                        block = {
                            type: "input",
                            label: {
                                text: value + " Question",
                                type: TextTypes.PLAIN_TEXT,
                            },
                            element: {
                                type: "plain_text_input",
                                placeholder: {
                                    type: TextTypes.PLAIN_TEXT,
                                    text: "Enter question for paragraphs",
                                },
                                blockId: value+"Block",
                                actionId: value+"Action",
                                appId: this.app.getID(),
                            },
                        };
                        questionBlocks.push(block);
                    } else if (value === "Multiple Choice") {
                        const questionBlock: LayoutBlock = {
                            type: "input",
                            label: {
                                text: value + " Question",
                                type: TextTypes.PLAIN_TEXT,
                            },
                            element: {
                                type: "plain_text_input",
                                placeholder: {
                                    type: TextTypes.PLAIN_TEXT,
                                    text: "Enter question for multiple choice",
                                },
                                blockId: value+"question"+"Block",
                                actionId: value+"question"+"Action",
                                appId: this.app.getID(),
                            },
                        };
                        const optionBlock: LayoutBlock = {
                            type: "input",
                            label: {
                                text: '',
                                type: TextTypes.PLAIN_TEXT,
                            },
                            element: {
                                type: "plain_text_input",
                                placeholder: {
                                    type: TextTypes.PLAIN_TEXT,
                                    text: "Option1,Option2,...",
                                },
                                blockId: value+"option"+"Block",
                                actionId: value+"option"+"Action",
                                appId: this.app.getID(),
                            },
                        };

                        questionBlocks.push(questionBlock, optionBlock);
                    } else {
                        break;
                    }

                    await questionPersistence.saveQuestionBlocks(
                        this.app.getID(),
                        questionBlocks,
                    );

                    const modal = await CreateFormModal({
                        read: this.read,
                        modify: this.modify,
                        http: this.http,
                        persis: this.persistence,
                        triggerId: triggerId,
                        threadId: threadId,
                        id: this.app.getID(),
                    });

                    if (triggerId) {
                        await this.modify
                            .getUiController()
                            .updateSurfaceView(modal, { triggerId }, user);
                    }
                    break;
                }
                default: {
                    console.log("Default executed");
                }
            }
        } catch (error) {
            console.warn("ExecuteBlockActionHandler Error:", error);
        }
        return {
            success: true,
        };
    }
}
