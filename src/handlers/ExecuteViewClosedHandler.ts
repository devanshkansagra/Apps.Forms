import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { SurveysApp } from "../../SurveysApp";
import { IUIKitResponse, UIKitViewCloseInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { ModalEnum } from "../enums/ModalEnum";
import { QuestionPersistence } from "../persistence/questionPersistence";

export class ExecuteViewClosedHandler {
    private context: UIKitViewCloseInteractionContext;
    constructor(
        protected readonly app: SurveysApp,
        protected readonly read: IRead,
        protected readonly http: IHttp,
        protected readonly persistence: IPersistence,
        protected readonly modify: IModify,
        context: UIKitViewCloseInteractionContext,
    ) {
        this.context = context;
    }

    public async execute():Promise<IUIKitResponse> {
        // const {view } = this.context.getInteractionData();
        // console.log(view);
        return { success: true } as any;
    }
}
