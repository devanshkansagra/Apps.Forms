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
import { ModalPersistence } from "../persistence/ModalPersistence";
import { OtherEnum } from "../enums/OtherEnums";

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
        const {
            actionId,
            triggerId,
            user,
            value,
            threadId,
            blockId,
            room,
            container,
        } = this.context.getInteractionData();

        const authPersistence = new AuthPersistence(this.app);
        const subscriptionPersistence = new SubscriptionPersistence(
            this.persistence,
            this.read.getPersistenceReader()
        );

        const questionPersistence = new QuestionPersistence(
            this.persistence,
            this.read.getPersistenceReader()
        );

        const modalPersistence = new ModalPersistence(
            this.persistence,
            this.read.getPersistenceReader(),
            user.id,
            container.id
        );
        const questionBlocks = await questionPersistence.getQuestionBlocks(
            this.app.getID()
        );
        try {
            switch (actionId) {
                case ElementEnum.ADD_QUESTION_ACTION: {
                    const QuestionName = `${
                        ElementEnum.QUESTION_TITLE_ACTION
                    }-${uuidv4()}`;
                    const QuestionType = `${
                        ElementEnum.QUESTION_TYPE_ACTION
                    }-${uuidv4()}`;

                    await modalPersistence.storeInteractionId({
                        QuestionType,
                        QuestionName,
                    });

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
                        modalPersistence: modalPersistence,
                        id: this.app.getID(),
                    })) as IUIKitSurfaceViewParam;
                    if (triggerId) {
                        await this.modify
                            .getUiController()
                            .updateSurfaceView(modal, { triggerId }, user);
                    }
                    break;
                }
                case ElementEnum.SUBSCRIPTION_ACTION: {
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

                case ElementEnum.SHARE_RESPONSES_ACTION: {
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

                case ElementEnum.ADD_OPTION_ACTION: {
                    const { data } =
                        await modalPersistence.getAllInteractionActionId();
                    const index = data.findIndex((record) => {
                        return (record?.[ElementEnum.QUESTION_TYPE] === value);
                    });

                    const options = data[index]?.[OtherEnum.ADDITIONAL_CONFIG]?.[OtherEnum.OPTIONS];

                    if (actionId.toString() === ElementEnum.ADD_OPTION_ACTION) {
                        options.push({
                            [ElementEnum.INPUT_FIELD]: `${ElementEnum.OPTIONS_ACTION}-${uuidv4()}`,
                        });
                    } else {
                        options.pop();
                    }

                    await modalPersistence.updateInteractionActionId(data);
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
                        modalPersistence: modalPersistence,
                        id: this.app.getID(),
                    })) as IUIKitSurfaceViewParam;
                    if (triggerId) {
                        await this.modify
                            .getUiController()
                            .updateSurfaceView(modal, { triggerId }, user);
                    }
                    break;
                }

                case ElementEnum.LOGIN_BUTTON_ACTION: {
                    console.log("Login");
                    break;
                }
                default: {
                    const questionTypeSelected =
                        ElementEnum.QUESTION_TYPE_ACTION.toString();
                    const questionTypeDispatchAction =
                        actionId.startsWith(questionTypeSelected);

                    if (questionTypeDispatchAction) {
                        const { data } =
                            await modalPersistence.getAllInteractionActionId();
                        const index = data.findIndex((record) => {
                            return (
                                record?.[ElementEnum.QUESTION_TYPE] === actionId
                            );
                        });

                        const QuestionName =
                            data[index]?.[ElementEnum.QUESTION_NAME];
                        const QuestionType =
                            data[index]?.[ElementEnum.QUESTION_TYPE];

                        const commonProperties = {
                            QuestionType,
                            QuestionName,
                        };

                        if (value) {
                            switch (value) {
                                case "RADIO":
                                case "CHECKBOX": {
                                    data[index] = {
                                        ...commonProperties,
                                        [OtherEnum.ADDITIONAL_CONFIG]: {
                                            type: value,
                                            [OtherEnum.OPTIONS]: [],
                                        },
                                    };
                                    break;
                                }
                                default: {
                                    data[index] = {
                                        ...commonProperties,
                                    };
                                }
                            }
                        }

                        await modalPersistence.updateInteractionActionId(data);
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
                            modalPersistence: modalPersistence,
                            id: this.app.getID(),
                        })) as IUIKitSurfaceViewParam;
                        if (triggerId) {
                            await this.modify
                                .getUiController()
                                .updateSurfaceView(modal, { triggerId }, user);
                        }
                    }
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
