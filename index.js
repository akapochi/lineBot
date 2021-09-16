'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

const axios = require('axios');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
  // if (event.type !== 'message' || event.message.type !== 'text') {
  //   // ignore non-text-message event
  //   return Promise.resolve(null);
  // }

  // // create a echoing text message
  // const echo = { type: 'text', text: `「${event.message.text}」というメッセージを受け取りました` };

  // // use reply API
  // return client.replyMessage(event.replyToken, echo);

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // 「天気教えて」以外の場合は反応しない
  if (event.message.text !== '天気教えて') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '「天気教えて」と言ってね'
    });
  }

  let replyText = '';
  replyText = 'ちょっと待ってね'; //「ちょっと待ってね」ってメッセージだけ先に処理
  await client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText
  });

  // axiosを使って天気APIにアクセス
  const CITY_ID = `130010`; // 取得したい地域のIDを指定
  const URL = `https://weather.tsukumijima.net/api/forecast?city=${CITY_ID}`;
  const res = await axios.get(URL);
  const pushText = res.data.description.bodyText;
  return client.pushMessage(event.source.userId, {
    type: 'text',
    text: pushText,
  });
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});