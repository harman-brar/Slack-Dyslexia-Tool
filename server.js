const slackEventsApi = require('@slack/events-api');
const SlackClient = require('@slack/client').WebClient;
const express = require('express');
const unirest = require('unirest');
// *** Initialize an Express application
const app = express();
//initializing request of text-to-speech
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');

//texttoSpeech object
const client = new textToSpeech.TextToSpeechClient();
// *** Initialize a client with your access token
const slack = new SlackClient(process.env.SLACK_ACCESS_TOKEN);

// *** Initialize event adapter using signing secret from environment variables ***
const slackEvents = slackEventsApi.createEventAdapter(process.env.SLACK_SIGNING_SECRET);

// Homepage
app.get('/', (req, res) => {
  const url = `https://${req.hostname}/slack/events`;
  res.setHeader('Content-Type', 'text/html');

  return res.send(`<pre>Copy this link to paste into the event URL field: <a href="${url}">${url}</a></pre>`);
});

// *** Plug the event adapter into the express app as middleware ***
app.use('/slack/events', slackEvents.expressMiddleware());

// *** Attach listeners to the event adapter ***
slackEvents.on('app_mention', (message) => {  
  
  
  if (message.text.startsWith('!tospeech')){
    
    const text1 = message.text;
    text1 = text1.substring(22, text1.length);
    
    const outputFile = 'output.mp3';
    
    
    const request = {
      input: {text: text1},
      voice: {languageCode: "en-US", ssmlGender: "FEMALE"},
      audioConfig: {audioEncoding: "MP3"},
    };
    

    client.synthesizeSpeech(request, (err, response) => {
      if (err) {
        console.error('ERROR:', err);
        return;
      }

      fs.writeFile(outputFile, response.audioContent, 'binary', err => {
        if (err) {
          console.error('ERROR:', err);
          return;
        }
        console.log(`Audio content written to file: ${outputFile}`); 
      });
    });
 
    
  }
  if (message.text.startsWith('!convertimage')){
      console.log(message);
      var stringArr = [];
      exports.url = message.text.replace("<@UEJF95CAJ>", "").replace("!convertimage ","").replace(/\s\s+/g, "").replace(/[<>]/g,"");
      console.log(exports.url);
    
      var azure = require('./azure');
      setTimeout(function(){ // BLOCKING DONE HERE TO ENSURE API RETURNS BEFORE WE CONTINUE
      var jsonResponse = JSON.parse(azure.jsonResponse);
      var myArray = jsonResponse.regions[0].lines;
      
      myArray.forEach(function(value) {
        value.words.forEach(function(text) {
            stringArr.push(text.text);
        });
      });
        
      unirest.get("https://img4me.p.mashape.com/?bcolor=FFFFFF&fcolor=000000&font=dyslexia&size=16&text=" + 
                   stringArr.join(" ") + "&type=png")
        .header("X-Mashape-Key", "909uxpbgjKmsheOR9mQd9lK2NhbNp1cjyUHjsnXwI516VyQegL")
        .header("Accept", "text/plain")
        .end(function (result) {
          var url = result.body;
          slack.chat.postMessage( {
            text: url,
            channel: message.channel,
            attachments: [{
              "fallback": "Required plain-text summary of the attachment.",
              "image_url": url
            }],
            thread_ts: message.ts
        })
        });
      
      }, 2000);
    }
  
  if (message.text.startsWith('!tofont')) {
        var url;
        console.log(message);

        //Sample API call from https://market.mashape.com/seikan/img4me-text-to-image-service
        unirest.get("https://img4me.p.mashape.com/?bcolor=FFFFFF&fcolor=000000&font=dyslexia&size=16&text=" + 
                    message.text.replace("<@UEJF95CAJ>", "").replace("!tofont ","") + "&type=png")
        .header("X-Mashape-Key", "909uxpbgjKmsheOR9mQd9lK2NhbNp1cjyUHjsnXwI516VyQegL")
        .header("Accept", "text/plain")
        .end(function (result) {
          url = result.body;
          slack.chat.postMessage( {
            text: url,
            channel: message.channel,
            attachments: [{
              "fallback": "Required plain-text summary of the attachment.",
              "image_url": url//message.files[0].permalink
            }],
            thread_ts: message.ts
        })
        });
    }  

});



// *** Handle errors ***
slackEvents.on('error', (error) => {
  if (error.code === slackEventsApi.errorCodes.TOKEN_VERIFICATION_FAILURE) {
    // This error type also has a `body` propery containing the request body which failed verification.
    console.error(`An unverified request was sent to the Slack events Request URL. Request body: \
${JSON.stringify(error.body)}`);
  } else {
    console.error(`An error occurred while handling a Slack event: ${error.message}`);
  }
});

// Start the express application
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
  
