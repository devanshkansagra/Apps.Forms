import { IRead } from "@rocket.chat/apps-engine/definition/accessors";

export async function getCredentials(
    read: IRead,
) {
    const clientId = (await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById('google-cloud-oauth-client-id'))

    const clientSecret = (await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById('google-cloud-oauth-client-secret'))

    const APIKey = (await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById('api-key'))


    return { clientId, APIKey, clientSecret };
}
