const https = require('https');

TextFlow = {}

const API_KEY = { value: "" }


/**
* Set the API key, so that the service knows that you are authorized to use it.
* @param {string} apiKey Unique key created using the [API Console](https://textflow.me/api)
* @example
* textflow.useKey("YOUR_API_KEY");
*/
TextFlow.useKey = function (apiKey) {
    API_KEY.value = apiKey;
    return TextFlow;
}

/**
 * Information about the delivered message
 * @typedef {Object} SendMessageData
 * @property {string} to
 * @property {string} content
 * @property {string} country_code
 * @property {number} price
 * @property {integer} timestamp
 */

/**
 * Result status of the TextFlow Send SMS API call
 * @typedef {Object} SendMessageResult
 * @property {boolean} ok True if the message was successfully sent, false otherwise. 
 * @property {integer} status Status code
 * @property {string} message Status message
 * @property {SendMessageData} [data] If the message was sent successfully, additional data about the message is returned
 */

/**
 * Callback function that handles the result of a Send SMS request
 * @callback sendSMSCallback
 * @param {SendMessageResult} result Result status of the TextFlow Send SMS API call as {@link SendMessageResult}.
 */

/**
* Method that is used to send an SMS. 
* @param {string} recipient Recipient phone number, formatted like `+381617581234`
* @param {string} text Message body
* @param {sendSMSCallback?} callback Callback function that handles the result of the Send SMS request
* @returns {Promise<SendMessageResult> | undefined} If callback is specified, the function does not return anything, but instead calls it, passing it the result as an argument. Otherwise, it returns {@link SendMessageResult}.
* @example
* textflow.useKey("YOUR_API_KEY");
* textflow.sendMessage(
    "+381617581234", 
    "This is message body. ", 
    result => { 
        if(!result.ok)
            return console.log("ERROR") 
        ...
    });
*/

TextFlow.sendSMS = async function (recipient, text, callback) {
    if (!recipient) {
        let bad_recipient = {
            ok: false,
            status: 400,
            message: "You have not specified the recipient. "
        };
        if (callback)
            return callback(bad_recipient);
        console.error(bad_recipient.message);
        return;
    }
    if (!text) {
        let bad_text = {
            ok: false,
            status: 400,
            message: "You have not specified the message body. "
        };
        if (callback)
            return callback(bad_text);
        console.error(bad_text.message);
        return;
    }
    if (!callback) {
        return new Promise((resolve, reject) => {
            TextFlow.sendSMS(recipient, text, (result) => {
                resolve(result);
            });
        })
    }
    if (!API_KEY.value) {
        let api_key_missing = {
            ok: false,
            status: 400,
            message: "You have not specified the API key. Specify it by calling the useKey function. "
        };
        if (!callback) {
            console.error(api_key_missing.message);
            return;
        }
        callback(api_key_missing);
        return;
    }
    let data = JSON.stringify({ recipient, text, apiKey: API_KEY.value });
    let options = {
        hostname: 'textflow.me',
        port: 443,
        path: '/messages/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }
    let req = https
        .request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let res = JSON.parse(data);
                let result = {
                    ok: res.ok,
                    status: res.status,
                    message: res.message
                };
                if (res.data) result.data = res.data;
                callback(result)
            });
        })
        .on('error', err => {
            callback({
                ok: err.ok,
                status: err.status,
                message: err.message
            });
        })
    req.write(data);
    req.end();
}



module.exports = TextFlow
