import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
    IUIKitSurfaceViewParam,
} from "@rocket.chat/apps-engine/definition/accessors";
import { UIKitSurfaceType } from "@rocket.chat/apps-engine/definition/uikit";
import { LayoutBlock } from "@rocket.chat/ui-kit";
import { TextTypes } from "../enums/TextTypes";
import { ModalEnum } from "../enums/ModalEnum";
import { ElementEnum } from "../enums/ElementEnum";
import { QuestionPersistence } from "../persistence/questionPersistence";

export async function CreateFormModal({
    read,
    modify,
    http,
    persis,
    triggerId,
    threadId,
    id,
}: {
    read: IRead;
    modify: IModify;
    http: IHttp;
    persis: IPersistence;
    triggerId: string | undefined;
    threadId: string | undefined;
    id: string;
}): Promise<IUIKitSurfaceViewParam> {
    let blocks: LayoutBlock[] = [];
    blocks.push(
        {
            type: "input",
            label: {
                type: TextTypes.PLAIN_TEXT,
                text: "Form Title",
            },
            element: {
                type: "plain_text_input",
                placeholder: {
                    type: TextTypes.PLAIN_TEXT,
                    text: "Untitled",
                },
                appId: id,
                blockId: ElementEnum.FORM_TITLE_BLOCK,
                actionId: ElementEnum.FORM_TITLE_ACTION,
            },
        },
        {
            type: "input",
            label: {
                type: TextTypes.PLAIN_TEXT,
                text: "Description",
            },
            element: {
                type: "plain_text_input",
                placeholder: {
                    type: TextTypes.PLAIN_TEXT,
                    text: "Form Description",
                },
                appId: id,
                blockId: ElementEnum.FORM_DESCRIPTION_BLOCK,
                actionId: ElementEnum.FORM_DESCRIPTION_ACTION,
                multiline: true,
            },
        },
    );

    const questionPersistence = new QuestionPersistence(
        persis,
        read.getPersistenceReader(),
    );
    const questionBlocks = await questionPersistence.getQuestionBlocks(id);
    if (questionBlocks) {
        if (questionBlocks.length > 0) {
            blocks.push(...questionBlocks);
        }
    }
    blocks.push({
        type: "actions",
        elements: [
            {
                type: "button",
                text: {
                    type: TextTypes.PLAIN_TEXT,
                    text: "Add Question",
                },
                blockId: ElementEnum.ADD_QUESTION_BLOCK,
                actionId: ElementEnum.ADD_QUESTION_ACTION,
                appId: id,
            },
        ],
    });

    return {
        type: UIKitSurfaceType.MODAL,
        id: ModalEnum.CREATE_FORM_VIEW,
        title: {
            type: TextTypes.PLAIN_TEXT,
            text: ModalEnum.CREATE_FORM_TITLE,
        },
        blocks: blocks,
        submit: {
            type: "button",
            text: {
                type: TextTypes.PLAIN_TEXT,
                text: "Create",
            },
            blockId: "",
            actionId: "",
            appId: id,
        },
        clearOnClose: true,
        close: {
            type: "button",
            text: {
                type: TextTypes.PLAIN_TEXT,
                text: "Close",
            },
            blockId: "",
            actionId: "",
            appId: id,
        },
    };
}
