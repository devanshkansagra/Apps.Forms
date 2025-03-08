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
import { ElementEnum } from "../enums/ElementEnum";
import { QuestionPersistence } from "../persistence/questionPersistence";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { sendMessage, sendNotification } from "../helpers/message";
import { ModalEnum } from "../enums/ModalEnum";
import { SDK } from "../lib/SDK";
import { FormsPersistence } from "../persistence/formsPersistence";

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

    public async execute(): Promise<IUIKitResponse> {
        const { view, user } = this.context.getInteractionData();
        const { state } = view;
        const room = (await this.read
            .getRoomReader()
            .getById("GENERAL")) as IRoom;
        const questionPersistence = new QuestionPersistence(
            this.persistence,
            this.read.getPersistenceReader(),
        );

        const formPersistence = new FormsPersistence(
            this.persistence,
            this.read.getPersistenceReader(),
        );

        const sdk = new SDK(this.http, this.app);

        try {
            switch (view.id) {
                case ModalEnum.CREATE_FORM_VIEW: {
                    const formData = {};
                    for (const blockId in state) {
                        if (state.hasOwnProperty(blockId)) {
                            const block = state[blockId];
                            for (const actionId in block) {
                                if (block.hasOwnProperty(actionId)) {
                                    formData[actionId] = block[actionId];
                                }
                            }
                        }
                    }

                    const res = await sdk.createGoogleForm(
                        formData,
                        user,
                        this.read,
                    );

                    const data = await formPersistence.getFormData(room, user);
                    data.push(res?.data);
                    await formPersistence.storeFormData(room, data, user);

                    if (!res) {
                        await sendNotification(
                            this.read,
                            this.modify,
                            user,
                            room,
                            "Unable to create Google Form please login to create",
                        );
                        return { success: false };
                    }

                    await sendNotification(
                        this.read,
                        this.modify,
                        user,
                        room,
                        "New Google Form Created by " +
                            user.name +
                            " : [Open to fill form]" +
                            "(" +
                            res?.data.responderUri +
                            ")",
                    );

                    await questionPersistence.deleteQuestionBlocks(
                        this.app.getID(),
                    );
                }
            }
        } catch (error) {
            console.log(error);
        }
        return {
            success: true,
        };
    }
}
