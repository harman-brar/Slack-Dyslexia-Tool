/**
 * Source code provided by Microsoft @ https://docs.microsoft.com/en-us/azure/cognitive-services/Computer-vision/quickstarts/node-print-text
*/
'use strict';

var server = require('./server');
const request = require('request');

// Replace <Subscription Key> with your valid subscription key.
const subscriptionKey = process.env.SUBSCRIPTION_KEY;

// You must use the same location in your REST call as you used to get your
// subscription keys. For example, if you got your subscription keys from
// westus, replace "westcentralus" in the URL below with "westus".
const uriBase =
    'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/ocr';

/*const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/' +
    'Atomist_quote_from_Democritus.png/338px-Atomist_quote_from_Democritus.png';*/

var imageUrl = server.url;

//const imageUrl = 'https://www.freepngimg.com/thumb/quotes/35394-5-quotes-file-thumb.png';

// Request parameters.
const params = {
    'language': 'unk',
    'detectOrientation': 'true',
};

var options = {
    uri: uriBase,
    qs: params,
    body: '{"url": ' + '"' + imageUrl + '"}',
    headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key' : subscriptionKey
    }
};


request.post(options, (error, response, body) => {
  if (error) {
    console.log('Error: ', error);
    return;
  }
  //console.log(body);
  let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
  //console.log(jsonResponse);//console.log(jsonResponse.regions[0]);
  exports.jsonResponse = jsonResponse;
  console.log(jsonResponse);
});




