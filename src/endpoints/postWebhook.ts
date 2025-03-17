import {
    ApiEndpoint,
    IApiEndpointInfo,
    IApiRequest,
    IApiResponse,
} from "@rocket.chat/apps-engine/definition/api";
import { SurveysApp } from "../../SurveysApp";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { AuthPersistence } from "../persistence/authPersistence";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { LayoutBlock } from "@rocket.chat/ui-kit";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";

export class PostWebhookEndpoint extends ApiEndpoint {
    public path: string = "webhook";
    constructor(public readonly app: SurveysApp) {
        super(app);
    }

    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IApiResponse> {
        let blocks: LayoutBlock[] = [];
        const user = await read.getUserReader().getById("bqK6RNoR86DEhSCMJ");
        const authPersistence = new AuthPersistence(this.app);
        const accessToken = await authPersistence.getAccessTokenForUser(
            user,
            read,
        );

        const responseData = await this.app.sdk.getFormResponses(
            request.content.message.attributes.formId,
            accessToken.token.token,
        );
        const formData = await this.app.sdk.getFormData(
            request.content.message.attributes.formId,
            user,
            read,
            accessToken.token.token,
        );

        const responses = responseData.data?.responses;
        const questionItems = formData.data.items;
        responses.sort((a, b) =>
            b.lastSubmittedTime.localeCompare(a.lastSubmittedTime),
        );
        const response = responses[0];
        const details =
            `**New Response Recieved**\n` +
            `**Submitted At**: ${new Date(response.lastSubmittedTime).toLocaleString()}\n`;

        const answers = questionItems
            .map((question) => {
                const questionId = question.questionItem?.question?.questionId;
                const questionTitle = question.title;

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

        const room: IRoom = (await read
            .getRoomReader()
            .getById("GENERAL")) as IRoom;
        const textSender = modify.getCreator().startMessage().setBlocks(blocks);
        if (room) {
            textSender.setRoom(room);
        }
        await modify.getCreator().finish(textSender);

        return {
            status: 200,
        };
    }
}
