# textflow.js

[![NPM](https://nodei.co/npm/textflow.js.png?downloads=true&stars=true)](https://www.npmjs.com/package/textflow.js)

### Supported Node.js Versions
* Node.js 14
* Node.js 16
* Node.js 18

## Installation
`npm install textflow.js` or `yarn add textflow.js`

## Sample Usage

### Just send a message

```javascript
const textflow = require("textflow.js");
textflow.useKey("YOUR_API_KEY"); //You can create one in the API Console at https://textflow.me

textflow.sendSMS("+381611231234", "Dummy message text...");
```

### Provide custom callback

```javascript
textflow.sendSMS("+381611231234", "Dummy message text...", (result) => {
  if (result.ok) {
    console.log("SUCCESS");
  }
})
```

### Await response

```javascript
async function async_function() {
  let result = await textflow.sendSMS("+381611231234", "Dummy message text...");
  console.log(result);
}
async_function();
```

### Example of the result of a successfully sent message

```json
{
    "ok": true,
    "status": 200,
    "message": "Message sent successfully",
    "data": {
        "to": "+381611231234",
        "content": "Dummy message text...",
        "country_code": "RS",
        "price": 0.05,
        "timestamp": 1674759108881
    }
}
```

### Example of the result of an unsuccessfully sent message

```json
{
    "ok": false,
    "status": 404,
    "message": "API key not found"
}
```

## Getting help

If you need help installing or using the library, please check the [FAQ](https://textflow.me) first, and contact us at [admin@textflow.me](mailto://admin@textflow.me) if you don't find an answer to your question.

If you've found a bug in the API, package or would like new features added, you are also free to contact us!
