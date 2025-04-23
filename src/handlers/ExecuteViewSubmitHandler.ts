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
import { ModalPersistence } from "../persistence/ModalPersistence";

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
        const { view, user , room } = this.context.getInteractionData();
        const { state } = view;
        const roomId = (await this.read
            .getRoomReader()
            .getById(room?.id as string)) as IRoom;
        const questionPersistence = new QuestionPersistence(
            this.persistence,
            this.read.getPersistenceReader(),
        );

        const formPersistence = new FormsPersistence(
            this.persistence,
            this.read.getPersistenceReader(),
        );

        const modalPersistence = new ModalPersistence(this.persistence, this.read.getPersistenceReader(), user.id, view.id);

        const sdk = this.app.sdk;

        try {
            switch (view.id) {
                case ModalEnum.CREATE_FORM_VIEW: {

                    const questions = view?.state?.[ElementEnum.QUESTION_TITLE_BLOCK];
                    console.log(view);
                    // const res = await sdk.createGoogleForm(
                    //     formData,
                    //     user,
                    //     this.read,
                    // );

                    // const data = (await formPersistence.getFormData(
                    //     room,
                    //     user,
                    // )) as Array<object>;
                    // data.push(res?.data);
                    // await formPersistence.storeFormData(room, data, user);

                    // if (!res) {
                    //     await sendNotification(
                    //         this.read,
                    //         this.modify,
                    //         user,
                    //         room,
                    //         "Unable to create Google Form please login to create",
                    //     );
                    //     return { success: false };
                    // }

                    // await sendNotification(
                    //     this.read,
                    //     this.modify,
                    //     user,
                    //     room,
                    //     "New Google Form Created by " +
                    //         user.name +
                    //         " : [Open to fill form]" +
                    //         "(" +
                    //         res?.data.responderUri +
                    //         ")",
                    // );

                    // await questionPersistence.deleteQuestionBlocks(
                    //     this.app.getID(),
                    // );

                    await modalPersistence.clearAllInteractionActionId();
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
