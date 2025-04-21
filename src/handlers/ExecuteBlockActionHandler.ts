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
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { ElementEnum } from "../enums/ElementEnum";
import { LayoutBlock } from "@rocket.chat/ui-kit";
import { TextTypes } from "../enums/TextTypes";
import { CreateFormModal } from "../modals/CreateFormModal";
import { QuestionPersistence } from "../persistence/questionPersistence";
import { sendMessage, sendNotification } from "../helpers/message";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { AuthPersistence } from "../persistence/authPersistence";
import { getCredentials } from "../helpers/getCredentials";
import { ISubscription } from "../definitions/ISubscription";
import { SubscriptionPersistence } from "../persistence/subscriptionPersistence";

export class ExecuteBlockActionHandler {
    private context: UIKitBlockInteractionContext;

    constructor(
        protected readonly app: SurveysApp,
        context: UIKitBlockInteractionContext,
        protected readonly read: IRead,
        protected readonly http: IHttp,
        protected readonly persistence: IPersistence,
        protected readonly modify: IModify
    ) {
        this.context = context;
    }

    public async execute(): Promise<IUIKitResponse | void> {
        const { actionId, triggerId, user, value, threadId, blockId, room } =
            this.context.getInteractionData();

        const authPersistence = new AuthPersistence(this.app);
        const subscriptionPersistence = new SubscriptionPersistence(
            this.persistence,
            this.read.getPersistenceReader()
        );

        const questionPersistence = new QuestionPersistence(
            this.persistence,
            this.read.getPersistenceReader()
        );
        const questionBlocks = await questionPersistence.getQuestionBlocks(
            this.app.getID()
        );
        try {
            switch (blockId) {
                case ElementEnum.ADD_QUESTION_BLOCK: {
                    const questionBlockId = uuidv4();
                    const questionActionId = uuidv4();
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
                                            value: "TEXT",
                                            text: {
                                                type: "plain_text",
                                                text: "Short Answer",
                                                emoji: true,
                                            },
                                        },
                                        {
                                            value: "PARAGRAPH",
                                            text: {
                                                type: "plain_text",
                                                text: "Paragraph",
                                                emoji: true,
                                            },
                                        },
                                        {
                                            value: "RADIO",
                                            text: {
                                                type: "plain_text",
                                                text: "Radio",
                                                emoji: true,
                                            },
                                        },
                                        {
                                            value: "CHECKBOX",
                                            text: {
                                                type: "plain_text",
                                                text: "Checkbox",
                                                emoji: true,
                                            },
                                        },
                                    ],
                                    placeholder: {
                                        type: "plain_text",
                                        text: "Select an item",
                                    },
                                    appId: this.app.getID(),
                                    blockId: ElementEnum.QUESTION_TYPE_BLOCK,
                                },
                            ],
                        },
                    ];

                    questionBlocks.push(...blocks);

                    await questionPersistence.saveQuestionBlocks(
                        this.app.getID(),
                        questionBlocks
                    );

                    const modal = (await CreateFormModal({
                        app: this.app,
                        read: this.read,
                        modify: this.modify,
                        http: this.http,
                        sender: user,
                        room: room,
                        persis: this.persistence,
                        triggerId: triggerId,
                        threadId: threadId,
                        id: this.app.getID(),
                    })) as IUIKitSurfaceViewParam;

                    if (triggerId) {
                        await this.modify
                            .getUiController()
                            .updateSurfaceView(modal, { triggerId }, user);
                    }
                    break;
                }
                case ElementEnum.QUESTION_TYPE_BLOCK: {
                    let blocks: LayoutBlock[] = [];
                    if (value === "RADIO" || value === "CHECKBOX") {
                        blocks.push({
                            type: "section",
                            accessory: {
                                type: "button",
                                blockId: ElementEnum.ADD_OPTION_BLOCK,
                                actionId: ElementEnum.ADD_OPTION_ACTION,
                                appId: this.app.getID(),
                                text: {
                                    type: "plain_text",
                                    text: "Add Option",
                                },
                            },
                        });
                    }

                    questionBlocks.push(...blocks);
                    await questionPersistence.saveQuestionBlocks(
                        this.app.getID(),
                        questionBlocks
                    );

                    const modal = (await CreateFormModal({
                        app: this.app,
                        read: this.read,
                        modify: this.modify,
                        http: this.http,
                        sender: user,
                        room: room,
                        persis: this.persistence,
                        triggerId: triggerId,
                        threadId: threadId,
                        id: this.app.getID(),
                    })) as IUIKitSurfaceViewParam;

                    if (triggerId) {
                        await this.modify
                            .getUiController()
                            .updateSurfaceView(modal, { triggerId }, user);
                    }
                    break;
                }

                case ElementEnum.ADD_OPTION_BLOCK: {
                    let optionActionId = uuidv4();
                    const blocks: LayoutBlock = {
                        type: "input",
                        label: {
                            text: "",
                            type: "plain_text",
                        },
                        element: {
                            type: "plain_text_input",
                            actionId: ElementEnum.OPTIONS_ACTION + optionActionId,
                            blockId: ElementEnum.OPTIONS_BLOCK,
                            appId: this.app.getID(),
                            placeholder: {
                                type: "plain_text",
                                text: "Untitled Option",
                            },
                        },
                    };

                    questionBlocks.splice(questionBlocks.length - 1, 0, blocks);
                    await questionPersistence.saveQuestionBlocks(
                        this.app.getID(),
                        questionBlocks
                    );

                    const modal = (await CreateFormModal({
                        app: this.app,
                        read: this.read,
                        modify: this.modify,
                        http: this.http,
                        sender: user,
                        room: room,
                        persis: this.persistence,
                        triggerId: triggerId,
                        threadId: threadId,
                        id: this.app.getID(),
                    })) as IUIKitSurfaceViewParam;

                    if (triggerId) {
                        await this.modify
                            .getUiController()
                            .updateSurfaceView(modal, { triggerId }, user);
                    }
                    break;
                }
                case ElementEnum.SUBSCRIPTION_BLOCK: {
                    const { topic } = await getCredentials(this.read);
                    try {
                        const token =
                            await authPersistence.getAccessTokenForUser(
                                user,
                                this.read
                            );
                        const accessToken = token.token;
                        const requestBody = {
                            watch: {
                                target: {
                                    topic: {
                                        topicName: topic,
                                    },
                                },
                                eventType: "RESPONSES",
                            },
                        };
                        const response = await this.http.post(
                            `https://forms.googleapis.com/v1/forms/${actionId}/watches`,
                            {
                                headers: {
                                    Authorization: `Bearer ${accessToken.token}`,
                                    "Content-Type": "application/json",
                                },
                                content: JSON.stringify(requestBody),
                                query: user.id,
                            }
                        );
                        if (response.data.error) {
                            throw new Error(
                                JSON.stringify(response.data.error)
                            );
                        } else {
                            const formId = actionId;
                            const userId = user.id;
                            const roomId = room?.id;
                            const watchId = response?.data.id;

                            const subscription: ISubscription = {
                                formId: formId,
                                watchId: watchId,
                                userId: userId,
                                roomId: roomId as string,
                            };

                            await subscriptionPersistence.subscribeForm(
                                subscription
                            );
                        }
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                }

                case ElementEnum.SHARE_RESPONSES_BLOCK: {
                    const token = await authPersistence.getAccessTokenForUser(
                        user,
                        this.read
                    );
                    const accessToken = token.token;
                    const formData = await this.app.sdk.getFormData(
                        actionId,
                        user,
                        this.read,
                        accessToken.token
                    );
                    const responseData = await this.app.sdk.getFormResponses(
                        actionId,
                        accessToken.token
                    );

                    const responses = responseData.data?.responses;
                    if (!responses) {
                        await sendNotification(
                            this.read,
                            this.modify,
                            user,
                            room as IRoom,
                            "Form has no responses"
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
                            "Unable to share responses. Please Login!"
                        );
                        return;
                    }

                    const blocks: LayoutBlock[] = [];
                    responses.sort((a, b) =>
                        b.lastSubmittedTime.localeCompare(a.lastSubmittedTime)
                    );
                    responses.forEach((response, index) => {
                        const details =
                            `**Response #${responses.length - index}**\n` +
                            `**Submitted At**: ${new Date(
                                response.lastSubmittedTime
                            ).toLocaleString()}\n`;

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
                            { type: "divider" }
                        );
                    });

                    await sendMessage(
                        this.read,
                        this.modify,
                        user,
                        room as IRoom,
                        "",
                        blocks
                    );
                }

                case ElementEnum.LOGIN_BUTTON_BLOCK: {
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
