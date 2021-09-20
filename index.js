"use strict";

const fs = require("fs");

let cityIds2;

fs.readFile('./data.json', 'utf8', (err, data) => {
  if (err) throw err;
  cityIds2 = JSON.parse(data);
});

const line = require("@line/bot-sdk");
const express = require("express");

const axios = require("axios");

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
app.post("/webhook", line.middleware(config), (req, res) => {
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
  if (event.type === "message") {
    return client.replyMessage(event.replyToken, {
      "type": "text",
      "text": "地方を選んでね",
      "quickReply": {
        "items": [
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "北海道",
              "data": "data=survey1&area=北海道",
              "displayText": "北海道"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "東北",
              "data": "data=survey1&area=東北",
              "displayText": "東北"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "関東",
              "data": "data=survey1&area=関東",
              "displayText": "関東"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "中部",
              "data": "data=survey1&area=中部",
              "displayText": "中部"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "近畿",
              "data": "data=survey1&area=近畿",
              "displayText": "近畿"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "中国・四国",
              "data": "data=survey1&area=中国・四国",
              "displayText": "中国・四国"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "九州",
              "data": "data=survey1&area=九州",
              "displayText": "九州"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "島々",
              "data": "data=survey1&area=島々",
              "displayText": "島々"
            }
          },
        ]
      }
    }
    )
  } else if (event.type === "postback") {
    const w_data = event.postback.data.split("&")[0].replace("data=", ""); // 質問の種類を一時格納
    const w_area = event.postback.data.split("&")[1].replace("area=", ""); // 地方を一時格納（数字）

    const cityArray = [];


    if (w_data === "survey1") {
      let i = 0;
      for (const cityObject of cityIds2[w_area]) {
        const newObj = {
          "type": "action",
          "action": {
            "type": "postback",
            "label": cityObject["name"],
            "data": `data=survey2&area=${w_area}&item=${i}`,
            "displayText": cityObject["name"]
          }
        }
        cityArray.push(newObj);
        i++;
      }

      client.replyMessage(event.replyToken, {
        "type": "text",
        "text": "地名を選んでね",
        "quickReply": {
          "items": cityArray
        }
      }
      )
    } else if (w_data === "survey2") {
      const w_item = event.postback.data.split("&")[2].replace("item=", ""); // 地名を一時格納（数字）

      const cityIndex = parseInt(w_item);
      const CITY_ID = cityIds2[w_area][cityIndex]["id"];


      let replyText = "";
      replyText = "ちょっと待ってね"; //「ちょっと待ってね」ってメッセージだけ先に処理
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: replyText
      });


      // axiosを使って天気APIにアクセス

      const URL = `https://weather.tsukumijima.net/api/forecast?city=${CITY_ID}`;
      const res = await axios.get(URL);
      const pushText = res.data.description.bodyText;
      return client.pushMessage(event.source.userId, {
        type: "text",
        text: pushText,
      });
    }
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});