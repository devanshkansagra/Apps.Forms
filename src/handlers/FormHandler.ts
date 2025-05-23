import { SurveysApp } from "../../SurveysApp";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { CreateFormModal } from "../modals/CreateFormModal";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { QuestionPersistence } from "../persistence/questionPersistence";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { FormsPersistence } from "../persistence/formsPersistence";
import { FormsListModal } from "../modals/FormsListModal";
import { SubscriptionModal } from "../modals/SubscriptionModal";
import { ModalPersistence } from "../persistence/ModalPersistence";
import { ModalEnum } from "../enums/ModalEnum";

export async function createForm(
    app: SurveysApp,
    read: IRead,
    modify: IModify,
    sender: IUser,
    room: IRoom,
    http: IHttp,
    persis: IPersistence,
    triggerId: string | undefined,
    threadId: string | undefined,
) {
    if (triggerId) {
        // Create the form modal
        const modal = await CreateFormModal({
            app,
            read,
            modify,
            http,
            sender,
            room,
            persis,
            triggerId,
            threadId,
            id: app.getID(),
        }) as IUIKitSurfaceViewParam;

        // Open the modal
        await modify
            .getUiController()
            .openSurfaceView(modal, { triggerId }, sender);
    }
}

export async function getForms(
    app: SurveysApp,
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
    persis: IPersistence,
    triggerId: string,
    threadId: string | undefined,
) {
    const formPersistence = new FormsPersistence(
        persis,
        read.getPersistenceReader(),
    );
    const data = await formPersistence.getFormData(room, user);
    const modal = await FormsListModal({
        read,
        modify,
        persis,
        triggerId,
        threadId,
        data,
        id: app.getID(),
    });

    await modify.getUiController().openSurfaceView(modal, { triggerId }, user);
}

export async function deleteForms(
    app: SurveysApp,
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
    persis: IPersistence,
) {
    const formPersistence = new FormsPersistence(
        persis,
        read.getPersistenceReader(),
    );
    const modalPersistence = new ModalPersistence(persis, read.getPersistenceReader(), user.id, ModalEnum.CREATE_FORM_VIEW);
    await formPersistence.clearFormData(room, user);
    await modalPersistence.clearAllInteractionActionId();
}

export async function subscribe(
    app: SurveysApp,
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
    persis: IPersistence,
    triggerId: string,
    threadId: string | undefined,
) {
    const formPersistence = new FormsPersistence(
        persis,
        read.getPersistenceReader(),
    );
    const data = await formPersistence.getFormData(room, user);
    const modal = await SubscriptionModal({
        read,
        modify,
        persis,
        triggerId,
        threadId,
        data,
        id: app.getID(),
    });

    await modify.getUiController().openSurfaceView(modal, { triggerId }, user);
}

export async function aiCreate(
    app: SurveysApp,
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
    persis: IPersistence,
    prompt: string,
) {
    await app.sdk.createAIForms(app, read, modify, user, room, persis, prompt);
}
