"use strict";

import * as fs from "fs";

type PlaceAndId = {
  "name": string;
  "id": string;
}

type AllPlaceAndId = {
  "北海道": PlaceAndId[];
  "東北": PlaceAndId[];
  "関東": PlaceAndId[];
  "中部": PlaceAndId[];
  "近畿": PlaceAndId[];
  "中国・四国": PlaceAndId[];
  "九州": PlaceAndId[];
  "島々": PlaceAndId[];
}

type AreaInfo = keyof AllPlaceAndId;

let cityIds2: AllPlaceAndId;

let areaArray: string[] = [];

fs.readFile('./data.json', 'utf8', (err, data) => {
  if (err) throw err;
  cityIds2 = JSON.parse(data);
  areaArray = Object.keys(cityIds2)
});

const areaReplyItems: QuickReplyItem[] = areaArray.map(area => {
  return {
    "type": "action",
    "action": {
      "type": "postback",
      "label": area,
      "data": `data=survey1&area=${area}`,
      "displayText": area
    }
  }
});

import { QuickReply, QuickReplyItem, Client, middleware, WebhookEvent } from "@line/bot-sdk";

import * as express from "express";

import axios from "axios";

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.CHANNEL_SECRET || "",
};

// create LINE SDK client
const client = new Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express.default();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/webhook", middleware(config), (req: express.Request, res: express.Response) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
async function handleEvent(event: WebhookEvent) {
  if (event.type === "message") {
    return client.replyMessage(event.replyToken, {
      "type": "text",
      "text": "地方を選んでね",
      "quickReply": {
        "items": areaReplyItems
      }
    }
    )
  } else if (event.type === "postback") {
    const w_data = event.postback.data.split("&")[0].replace("data=", ""); // 質問の種類を一時格納
    const w_area: AreaInfo = event.postback.data.split("&")[1].replace("area=", "") as AreaInfo; // 地方を一時格納（数字）

    const cityArray = [];

    if (w_data === "survey1") {
      let i = 0;
      for (const cityObject of cityIds2[w_area]) {
        const newObj: QuickReplyItem = {
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


      // axiosを使って天気APIにアクセス

      type WeatherInfo = {
        "publicTime": string;
        "publicTimeFormatted": string;
        "headlineText": string;
        "bodyText": string;
        "text": string;
      }


      const URL = `https://weather.tsukumijima.net/api/forecast?city=${CITY_ID}`;
      const res = await axios.get(URL);
      let description: WeatherInfo = res.data.description;
      const replyText = description.bodyText;
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: replyText,
      });
    }
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});