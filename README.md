[pub_sub_setup.webm](https://github.com/user-attachments/assets/f48e5d54-b7c9-4d75-8306-d2a5fcd7bb3e)# GoogleForm Integration for RocketChat (Prototype)

![Rocket Chat](https://github.com/user-attachments/assets/f9d4c7f5-3b1d-4e53-8fed-69975f5562ef)


This project aims to bring the core functionality of tools like Google Forms directly into Rocket.Chat, enabling teams to create, distribute, and analyze surveys or feedback without switching platforms. Similar to Google Forms, users will be able to generate forms within Rocket.Chat—complete with customizable fields and sharing options—but with added capabilities like AI-powered form creation via natural language prompts. Real-time response notifications and automatic summary reports posted to designated channels ensure feedback loops stay active and visible, all within the chat workspace.

## 📜 Getting Started

### Prerequisites

-   You need a Rocket.Chat Server Setup
-   Rocket.Chat.Apps CLI,

*   In case you don't have run:
    ```sh
    npm install -g @rocket.chat/apps-cli
    ```

### ⚙️ Installation

-   Every RocketChat Apps runs on RocketChat Server, thus everytime you wanna test you need to deploy the app with this note. lets start setting up:

1. Clone the repo
    ```sh
    git clone https://github.com/<yourusername>/Apps.Notion
    ```
2. Install NPM packages
    ```sh
    npm install
    ```
3. Deploy app using:

    ```sh
    rc-apps deploy --url <url> --username <username> --password <password>
    ```

## Documentation

### Setting up the Google OAuth Client

- Tutorial to setup the Google OAuth Client:
  [oauth_setup_demo (1).webm](https://github.com/user-attachments/assets/2a22f8ca-7cbc-4acf-b2e9-43e738a6187f)

- Copy the `client_id` and `client_secret` to the App's Settings (Go to Installed Apps and Settings tab in RC,you would see two input fields. Add `client_id` & `client_secret`)

## Setting Google Cloud Pub/Sub
- Tutorial to setup the Google Cloud Pub/Sub:
  [pub_sub_setup.webm](https://github.com/user-attachments/assets/2618d69f-6b1e-4f48-ad32-cc36f7753110)


- Copy the pub sub topic to the App's Settings

## Setting Gemini API Key
- Tutorial to setup the Gemini API Key
  [gemini_setup_demo.webm](https://github.com/user-attachments/assets/93281ee4-3f9c-4b44-ac4d-a0e2d77094d7)

- Copy the API Key and add it to the App's Settings

Here are some links to examples and documentation:

- [Rocket.Chat Apps TypeScript Definitions Documentation](https://rocketchat.github.io/Rocket.Chat.Apps-engine/)
- [Rocket.Chat Apps TypeScript Definitions Repository](https://github.com/RocketChat/Rocket.Chat.Apps-engine)
- [Example Rocket.Chat Apps](https://github.com/graywolf336/RocketChatApps)
- Community Forums
    - [App Requests](https://forums.rocket.chat/c/rocket-chat-apps/requests)
    - [App Guides](https://forums.rocket.chat/c/rocket-chat-apps/guides)
    - [Top View of Both Categories](https://forums.rocket.chat/c/rocket-chat-apps)
- [#rocketchat-apps on Open.Rocket.Chat](https://open.rocket.chat/channel/rocketchat-apps)
