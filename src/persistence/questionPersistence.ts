import { IPersistence, IPersistenceRead } from "@rocket.chat/apps-engine/definition/accessors";
import { RocketChatAssociationModel, RocketChatAssociationRecord } from "@rocket.chat/apps-engine/definition/metadata";
import { LayoutBlock } from "@rocket.chat/ui-kit";

const QUESTION_BLOCKS_KEY = 'question_blocks';

export class QuestionPersistence {
    constructor(
        private readonly persistence: IPersistence,
        private readonly persistenceRead: IPersistenceRead
    ) {}

    public async getQuestionBlocks(appId: string): Promise<LayoutBlock[]> {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `${QUESTION_BLOCKS_KEY}_${appId}`
                ),
            ];
            const data = await this.persistenceRead.readByAssociations(associations);
            if (data.length > 0) {
                return data[0] as LayoutBlock[];
            }
            return [];
        } catch (error) {
            console.warn("Get Question Blocks Error:", error);
            return [];
        }
    }

    public async saveQuestionBlocks(appId: string, blocks: LayoutBlock[]): Promise<void> {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `${QUESTION_BLOCKS_KEY}_${appId}`
                ),
            ];
            await this.persistence.updateByAssociations(associations, blocks, true);
        } catch (error) {
            console.warn("Save Question Blocks Error:", error);
        }
    }

    public async deleteQuestionBlocks(appId: string): Promise<void> {
        try {
            const associations: Array<RocketChatAssociationRecord> = [
                new RocketChatAssociationRecord(
                    RocketChatAssociationModel.MISC,
                    `${QUESTION_BLOCKS_KEY}_${appId}`
                ),
            ];
            await this.persistence.removeByAssociations(associations);
        } catch (error) {
            console.warn("Delete Question Blocks Error:", error);
        }
    }
}
