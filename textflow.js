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
 * Information about the phone verification process
 * @typedef {Object} VerifyPhoneData
 * @property {string} verification_code
 * @property {integer} expires
 * @property {string} message_text
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
 * Result status of the TextFlow Verify phone number API call
 * @typedef {Object} VerifyPhoneResult
 * @property {boolean} ok True if the verification message was successfully sent, false otherwise. 
 * @property {integer} status Status code
 * @property {string} message Status message
 * @property {VerifyPhoneData} [data] If the message was sent successfully, additional data about the verification is returned, including the message text, verification code and the expiration of the message as a timestamp.
 */

/**
 * Options about the verification process, including your identification, verification code length and how long is it valid for. 
 * @typedef {Object} VerificationOptions
 * @property {string} [provider] What the user will see in the verification message, if the provider is `Guest`, he would get a message: `"Your verification code for Guest is: CODE"`. Default is none. 
 * @property {number} [minutes] How many minutes is the code valid for. Default is 30. Maximum is one day (or 1440 minutes). 
 * @property {integer} [code_length] How many digits will the code have. Default is 4 and the allowed values are [1, 10]. 
 */

/**
 * Callback function that handles the result of a Send SMS request
 * @callback sendSMSCallback
 * @param {SendMessageResult} result Result status of the TextFlow Send SMS API call as {@link SendMessageResult}.
 */

/**
 * Callback function that handles the result of a sendVerificationSMS request
 * @callback verifyPhoneCallback
 * @param {VerifyPhoneResult} result Result status of the TextFlow Verify phone number API call as  {@link SendMessageResult}.
 */

/**
 * 
 * @param {string} phone_number Phone number to verify, including country calling code, like `+381617581234`
 * @param {VerificationOptions?} options Options about the verification process, including your identification, verification code length and how long is it valid for. 
 * @param {verifyPhoneCallback?} callback Callback function that handles the result of the Verify phone number request
 * @returns {Promise<VerifyPhoneResult> | undefined}  If callback is specified, the function does not return anything, but instead calls it, passing it the {@link VerifyPhoneResult} as an argument. Otherwise, it returns the promise of {@link VerifyPhoneResult}.
 * @example
 * //User has sent his phone number for verification
 * textflow.sendVerificationSMS(phone_number);
 * 
 * //Show him the code submission form
 * 
 * //The user has submitted the code
 * let result = await textflow.verifyCode(phone_number, verification_code);
 * if(result.valid){
 *     //The user is real
 * }
 * else{
 *     //Maybe there was a typo?
 * }
 * 
 */
TextFlow.sendVerificationSMS = async function (phone_number, options, callback) {
    if (!phone_number) {
        let bad_phone_number = {
            ok: false,
            status: 400,
            message: "You have not specified the phone number. "
        };
        if (callback)
            return callback(bad_phone_number);
        console.error(bad_phone_number.message);
        return;
    }

    if (!callback) {
        return new Promise((resolve, reject) => {
            TextFlow.sendVerificationSMS(phone_number, options, (result) => {
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


    let data = JSON.stringify({
        phone_number,
        provider: options?.provider,
        minutes: options?.minutes,
        code_length: options?.code_length,
    });

    let reqOptions = {
        hostname: 'textflow.me',
        port: 443,
        path: '/phone/verify',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': "Bearer " + API_KEY.value
        }
    }
    let req = https
        .request(reqOptions, res => {
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


/**
* Method that is used to send an SMS. 
* @param {string} recipient Recipient phone number, including country calling code, like `+381617581234`
* @param {string} text Message body
* @param {sendSMSCallback?} callback Callback function that handles the result of the Send SMS request
* @returns {Promise<SendMessageResult> | undefined} If callback is specified, the function does not return anything, but instead calls it, passing it the {@link SendMessageResult} as an argument. Otherwise, it returns the promise of {@link SendMessageResult}.
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
    let data = JSON.stringify({ recipient, text });
    let reqOptions = {
        hostname: 'textflow.me',
        port: 443,
        path: '/messages/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': "Bearer " + API_KEY.value
        }
    }
    let req = https
        .request(reqOptions, res => {
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
