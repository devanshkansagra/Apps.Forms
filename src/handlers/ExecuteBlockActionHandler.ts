import { v4 as uuidv4 } from "uuid";
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
import { LayoutBlock } from "@rocket.chat/ui-kit";
import { TextTypes } from "../enums/TextTypes";
import { CreateFormModal } from "../modals/CreateFormModal";
import { QuestionPersistence } from "../persistence/questionPersistence";
import { sendMessage, sendNotification } from "../helpers/message";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";

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
        const { actionId, triggerId, user, value, threadId, blockId, room } =
            this.context.getInteractionData();

        try {
            switch (actionId) {
                case ElementEnum.ADD_QUESTION_ACTION: {
                    const questionPersistence = new QuestionPersistence(
                        this.persistence,
                        this.read.getPersistenceReader(),
                    );
                    const questionBlocks =
                        await questionPersistence.getQuestionBlocks(
                            this.app.getID(),
                        );

                    const questionBlockId = uuidv4();
                    const questionActionId = uuidv4();
                    const questionTypeBlockId = uuidv4();
                    const questionTypeActionId = uuidv4();

                    let blocks: LayoutBlock[] = [
                        {
                            type: "input",
                            label: {
                                type: TextTypes.PLAIN_TEXT,
                                text: "Add new question",
                            },
                            element: {
                                type: "plain_text_input",
                                placeholder: {
                                    text: "Untitled Question",
                                    type: TextTypes.PLAIN_TEXT,
                                },
                                blockId:
                                    ElementEnum.QUESTION_ACTION +
                                    questionBlockId,
                                actionId:
                                    ElementEnum.QUESTION_ACTION +
                                    questionActionId,
                                appId: this.app.getID(),
                            },
                        },
                        {
                            type: "actions",
                            elements: [
                                {
                                    type: "static_select",
                                    actionId:
                                        ElementEnum.QUESTION_TYPE_ACTION +
                                        questionTypeActionId,
                                    options: [
                                        {
                                            value: "short-answer",
                                            text: {
                                                type: "plain_text",
                                                text: "Short Answer",
                                                emoji: true,
                                            },
                                        },
                                        {
                                            value: "paragraph",
                                            text: {
                                                type: "plain_text",
                                                text: "Paragraph",
                                                emoji: true,
                                            },
                                        },
                                    ],
                                    placeholder: {
                                        type: "plain_text",
                                        text: "Select an item",
                                    },
                                    appId: this.app.getID(),
                                    blockId:
                                        ElementEnum.QUESTION_TYPE_ACTION +
                                        questionTypeBlockId,
                                },
                            ],
                        },
                    ];

                    questionBlocks.push(...blocks);

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
                case ElementEnum.QUESTION_TYPE_ACTION: {
                    // Handle question type selection here if needed
                    break;
                }

                case ElementEnum.SHARE_RESPONSES_ACTION: {
                    const { data } = await this.app.sdk.getFormResponses(
                        blockId,
                        user,
                        this.read,
                    );
                    const responses = data?.responses;

                    const blocks: LayoutBlock[] = [];
                    responses.forEach((response, index) => {
                        const details =
                            `Response #${index + 1}\n` +
                            `Last Submitted At: ${new Date(response.lastSubmittedTime).toLocaleString()}\n`;
                        const answers = Object.keys(response.answers)
                            .map((questionId, idx) => {
                                const answerValue = response.answers[
                                    questionId
                                ].textAnswers.answers
                                    .map((a) => a.value)
                                    .join(", ");
                                return `\nQuestion ${idx + 1}\nAnswer: ${answerValue}`;
                            })
                            .join("\n");

                        blocks.push(
                            {
                                type: "section",
                                text: {
                                    type: "mrkdwn",
                                    text: details + answers,
                                },
                            },
                            { type: "divider" },
                        );
                    });

                    await sendMessage(
                        this.read,
                        this.modify,
                        user,
                        room as IRoom,
                        "",
                        blocks,
                    );
                }

                case ElementEnum.LOGIN_BUTTON_ACTION: {
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
