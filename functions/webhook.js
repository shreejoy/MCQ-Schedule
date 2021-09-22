const TelegramBot = require("node-telegram-bot-api");

exports.handler = async (event, context) => {
    if (event.path == "/webhook") {
        const api_key = event.queryStringParameters.api_key;

        if (api_key !== process.env.api_key) {
            return {
                statusCode: 403,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({ OK: false, error: "Unauthorized" }),
                isBase64Encoded: false,
            };
        }

        const token = process.env.bot_token;
        const bot = new TelegramBot(token, { polling: false });
        const imageUrl = `https://${event.headers.host}/screenshot/table?id=${context.awsRequestId}`;
        var caption = `🔔 <b>New MCQ schedule published</b>

❔ <b>Important links</b>:
    - <a href="https://${event.headers.host}/#timetable">Timetable</a>
    - <a href="https://${event.headers.host}/#moderator">Moderator</a>
    - <a href="https://${event.headers.host}/#topics">Topics</a>
    - <a href="https://${event.headers.host}/#contributors">Contributors</a>
    - <a href="https://${event.headers.host}/#slots">Slots</a>`;

        const sendPhotoOptions = {
            caption: caption,
            parse_mode: "HTML",
        };

        try {
            const sendPhoto = await bot.sendPhoto(
                process.env.chat_id,
                imageUrl,
                sendPhotoOptions
            );
            // eslint-disable-next-line no-unused-vars
            const pinMessage = await bot.pinChatMessage(
                process.env.chat_id,
                sendPhoto.message_id
            );
            return {
                statusCode: 200,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({ OK: true }),
                isBase64Encoded: false,
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({
                    OK: false,
                    error: error,
                    imageUrl: imageUrl,
                }),
                isBase64Encoded: false,
            };
        }
    } else if (event.path == '/webhook/telegram') {
        
    }
};
