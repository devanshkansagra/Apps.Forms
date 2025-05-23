import { IRead } from "@rocket.chat/apps-engine/definition/accessors";

export async function getCredentials(read: IRead) {
    const clientId = await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById("client-id");

    const clientSecret = await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById("client-secret");

    const APIKey = await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById("gemini-api-key");

    const topic = await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById("google-cloud-pub-sub-topic");

    return { clientId, APIKey, clientSecret, topic };
}
