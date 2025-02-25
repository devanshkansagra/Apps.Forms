import { IRead } from "@rocket.chat/apps-engine/definition/accessors";

export async function getCredentials(
    read: IRead,
) {

    const settings = read.getEnvironmentReader().getServerSettings();
    const clientId = (await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById('google-cloud-oauth-client-id'))

    const clientSecret = (await read
        .getEnvironmentReader()
        .getServerSettings()
        .getValueById('google-cloud-oauth-client-secret'))

    const redirectURL = (await read.getEnvironmentReader().getSettings().getValueById('google-cloud-callback'));

    const APIKey = (await read
        .getEnvironmentReader()
        .getServerSettings()
        .getValueById('api-key'))


    return { clientId, APIKey, clientSecret, redirectURL, settings };
}
