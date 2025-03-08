import { SurveysApp } from "../../SurveysApp";
import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { CreateFormModal } from "../modals/CreateFormModal";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { QuestionPersistence } from "../persistence/questionPersistence";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { FormsPersistence } from "../persistence/formsPersistence";
import { format } from "util";

export async function createForm(
    app: SurveysApp,
    read: IRead,
    modify: IModify,
    sender: IUser,
    http: IHttp,
    persis: IPersistence,
    triggerId: string | undefined,
    threadId: string | undefined,
) {
    if (triggerId) {

        // Create the form modal
        const modal = await CreateFormModal({
            read,
            modify,
            http,
            persis,
            triggerId,
            threadId,
            id: app.getID(),
        });

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
) {
    const formPersistence = new FormsPersistence(persis, read.getPersistenceReader());
    const data = await formPersistence.getFormData(room, user);
    console.log(data);
}

export async function deleteForms(
    app: SurveysApp,
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom,
    persis: IPersistence,
) {
    const formPersistence = new FormsPersistence(persis, read.getPersistenceReader());
    await formPersistence.clearFormData(room, user);
}
