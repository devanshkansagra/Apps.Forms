import { v4 as uuidv4 } from "uuid";
import {
    IUIKitResponse,
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { SurveysApp } from "../../SurveysApp";
import {
    IHttp,
    IHttpResponse,
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
import { AuthPersistence } from "../persistence/authPersistence";

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

    public async execute(): Promise<IUIKitResponse | void> {
        const { actionId, triggerId, user, value, threadId, blockId, room } =
            this.context.getInteractionData();

        const authPersistence = new AuthPersistence(this.app);

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
                case ElementEnum.SUBSCRIPTION_ACTION: {
                    try {
                        const token =
                            await authPersistence.getAccessTokenForUser(
                                user,
                                this.read,
                            );
                        const accessToken = token.token;
                        const requestBody = {
                            watch: {
                                target: {
                                    topic: {
                                        topicName:
                                            "projects/forms-project-451808/topics/forms-responses",
                                    },
                                },
                                eventType: "RESPONSES",
                            },
                        };
                        const response = await this.http.post(
                            `https://forms.googleapis.com/v1/forms/${blockId}/watches`,
                            {
                                headers: {
                                    Authorization: `Bearer ${accessToken.token}`,
                                    "Content-Type": "application/json",
                                },
                                content: JSON.stringify(requestBody),
                                query: user.id
                            },
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                }

                case ElementEnum.SHARE_RESPONSES_ACTION: {
                    const token = await authPersistence.getAccessTokenForUser(
                        user,
                        this.read,
                    );
                    const accessToken = token.token;
                    const formData = await this.app.sdk.getFormData(
                        blockId,
                        user,
                        this.read,
                        accessToken.token,
                    );
                    const responseData = await this.app.sdk.getFormResponses(
                        blockId,
                        accessToken.token,
                    );

                    const responses = responseData.data?.responses;
                    if (!responses) {
                        await sendNotification(
                            this.read,
                            this.modify,
                            user,
                            room as IRoom,
                            "Form has no responses",
                        );
                        return;
                    }
                    const questionItems = formData.data.items;

                    if (
                        !formData.statusCode.toString().startsWith("2") ||
                        !responseData.statusCode.toString().startsWith("2")
                    ) {
                        await sendNotification(
                            this.read,
                            this.modify,
                            user,
                            room as IRoom,
                            "Unable to share responses. Please Login!",
                        );
                        return;
                    }

                    const blocks: LayoutBlock[] = [];
                    responses.sort((a, b) => b.lastSubmittedTime.localeCompare(a.lastSubmittedTime));
                    responses.forEach((response, index) => {
                        const details =
                            `**Response #${responses.length - index}**\n` +
                            `**Submitted At**: ${new Date(response.lastSubmittedTime).toLocaleString()}\n`;

                        const answers = questionItems
                            .map((question) => {
                                const questionId =
                                    question.questionItem?.question?.questionId;
                                const questionTitle = question.title;

                                // Find the corresponding answer using the questionId
                                const answerObj = response.answers[questionId];
                                const answerValue = answerObj
                                    ? answerObj.textAnswers.answers
                                          .map((a) => a.value)
                                          .join(", ")
                                    : "No answer provided";

                                return `\n**Question**: ${questionTitle}\n**Answer**: ${answerValue}`;
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
