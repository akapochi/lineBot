"use strict";

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


    const cityIds = {
      "稚内": "011000", // "01"で始まるのが北海道
      "旭川": "012010",
      "留萌": "012020",
      "網走": "013010",
      "北見": "013020",
      "紋別": "013030",
      "根室": "014010",
      "釧路": "014020",
      "帯広": "014030",
      "室蘭": "015010",
      "浦河": "015020",
      "札幌": "016010",
      "岩見沢": "016020",
      "倶知安": "016030",
      "函館": "017010",
      "江差": "017020",
      "青森": "020010",
      "むつ": "020020",
      "八戸": "020030",
      "盛岡": "030010",
      "宮古": "030020",
      "大船渡": "030030",
      "仙台": "040010",
      "白石": "040020",
      "秋田": "050010",
      "横手": "050020",
      "山形": "060010",
      "米沢": "060020",
      "酒田": "060030",
      "新庄": "060040",
      "福島": "070010",
      "小名浜": "070020",
      "若松": "070030",
      "水戸": "080010",
      "土浦": "080020",
      "宇都宮": "090010",
      "大田原": "090020",
      "前橋": "100010",
      "みなかみ": "100020",
      "さいたま": "110010",
      "熊谷": "110020",
      "秩父": "110030",
      "千葉": "120010",
      "銚子": "120020",
      "館山": "120030",
      "東京": "130010",
      "大島": "130020",
      "八丈島": "130030",
      "父島": "130040",
      "横浜": "140010",
      "小田原": "140020",
      "新潟": "150010",
      "長岡": "150020",
      "高田": "150030",
      "相川": "150040",
      "富山": "160010",
      "伏木": "160020",
      "金沢": "170010",
      "輪島": "170020",
      "福井": "180010",
      "敦賀": "180020",
      "甲府": "190010",
      "河口湖": "190020",
      "長野": "200010",
      "松本": "200020",
      "飯田": "200030",
      "岐阜": "210010",
      "高山": "210020",
      "静岡": "220010",
      "網代": "220020",
      "三島": "220030",
      "浜松": "220040",
      "名古屋": "230010",
      "豊橋": "230020",
      "津": "240010",
      "尾鷲": "240020",
      "大津": "250010",
      "彦根": "250020",
      "京都": "260010",
      "舞鶴": "260020",
      "大阪": "270000",
      "神戸": "280010",
      "豊岡": "280020",
      "奈良": "290010",
      "風屋": "290020",
      "和歌山": "300010",
      "潮岬": "300020",
      "鳥取": "310010",
      "米子": "310020",
      "松江": "320010",
      "浜田": "320020",
      "西郷": "320030",
      "岡山": "330010",
      "津山": "330020",
      "広島": "340010",
      "庄原": "340020",
      "下関": "350010",
      "山口": "350020",
      "柳井": "350030",
      "萩": "350040",
      "徳島": "360010",
      "日和佐": "360020",
      "高松": "370000",
      "松山": "380010",
      "新居浜": "380020",
      "宇和島": "380030",
      "高知": "390010",
      "室戸岬": "390020",
      "清水": "390030",
      "福岡": "400010",
      "八幡": "400020",
      "飯塚": "400030",
      "久留米": "400040",
      "佐賀": "410010",
      "伊万里": "410020",
      "長崎": "420010",
      "佐世保": "420020",
      "厳原": "420030",
      "福江": "420040",
      "熊本": "430010",
      "阿蘇乙姫": "430020",
      "牛深": "430030",
      "人吉": "430040",
      "大分": "440010",
      "中津": "440020",
      "日田": "440030",
      "佐伯": "440040",
      "宮崎": "450010",
      "延岡": "450020",
      "都城": "450030",
      "高千穂": "450040",
      "鹿児島": "460010",
      "鹿屋": "460020",
      "種子島": "460030",
      "名瀬": "460040",
      "那覇": "471010",
      "名護": "471020",
      "久米島": "471030",
      "南大東": "472000",
      "宮古島": "473000",
      "石垣島": "474010",
      "与那国島": "474020"
    }

    const cityIds2 = {
      "北海道": [  // 16個
        { "name": "稚内", "id": "011000" },
        { "name": "旭川", "id": "012010" },
        { "name": "留萌", "id": "012020" },
        { "name": "網走", "id": "013010" },
        // { "name": "北見", "id": "013020" },
        { "name": "紋別", "id": "013030" },
        // { "name": "根室", "id": "014010" },
        { "name": "釧路", "id": "014020" },
        { "name": "帯広", "id": "014030" },
        { "name": "室蘭", "id": "015010" },
        { "name": "浦河", "id": "015020" },
        { "name": "札幌", "id": "016010" },
        // { "name": "岩見沢", "id": "016020" },
        { "name": "倶知安", "id": "016030" },
        { "name": "函館", "id": "017010" },
        { "name": "江差", "id": "017020" },
      ],
      "東北": [  // 17個
        { "name": "青森", "id": "020010" },
        // { "name": "むつ", "id": "020020" },
        { "name": "八戸", "id": "020030" },
        { "name": "盛岡", "id": "030010" },
        { "name": "宮古", "id": "030020" },
        { "name": "大船渡", "id": "030030" },
        { "name": "仙台", "id": "040010" },
        // { "name": "白石", "id": "040020" },
        { "name": "秋田", "id": "050010" },
        { "name": "横手", "id": "050020" },
        { "name": "山形", "id": "060010" },
        // { "name": "米沢", "id": "060020" },
        { "name": "酒田", "id": "060030" },
        // { "name": "新庄", "id": "060040" },
        { "name": "福島", "id": "070010" },
        { "name": "小名浜", "id": "070020" },
        { "name": "若松", "id": "070030" },
      ],
      "関東": [  // 18個
        { "name": "水戸", "id": "080010" },
        // { "name": "土浦", "id": "080020" },
        { "name": "宇都宮", "id": "090010" },
        { "name": "大田原", "id": "090020" },
        { "name": "前橋", "id": "100010" },
        { "name": "みなかみ", "id": "100020" },
        { "name": "さいたま", "id": "110010" },
        { "name": "熊谷", "id": "110020" },
        { "name": "秩父", "id": "110030" },
        { "name": "千葉", "id": "120010" },
        { "name": "銚子", "id": "120020" },
        // { "name": "館山", "id": "120030" },
        { "name": "東京", "id": "130010" },
        // { "name": "大島", "id": "130020" },  // この3つは「島々」に移動
        // { "name": "八丈島", "id": "130030" },
        // { "name": "父島", "id": "130040" },
        { "name": "横浜", "id": "140010" },
        { "name": "小田原", "id": "140020" },
      ],
      "中部": [  // 23個
        { "name": "新潟", "id": "150010" },
        { "name": "長岡", "id": "150020" },
        // { "name": "高田", "id": "150030" },
        // { "name": "相川", "id": "150040" },
        { "name": "富山", "id": "160010" },
        // { "name": "伏木", "id": "160020" },
        { "name": "金沢", "id": "170010" },
        // { "name": "輪島", "id": "170020" },
        { "name": "福井", "id": "180010" },
        // { "name": "敦賀", "id": "180020" },
        { "name": "甲府", "id": "190010" },
        // { "name": "河口湖", "id": "190020" },
        { "name": "長野", "id": "200010" },
        { "name": "松本", "id": "200020" },
        // { "name": "飯田", "id": "200030" },
        { "name": "岐阜", "id": "210010" },
        // { "name": "高山", "id": "210020" },
        { "name": "静岡", "id": "220010" },
        // { "name": "網代", "id": "220020" },
        { "name": "三島", "id": "220030" },
        { "name": "浜松", "id": "220040" },
        { "name": "名古屋", "id": "230010" },
        // { "name": "豊橋", "id": "230020" },
      ],
      "近畿": [  // 13個
        { "name": "津", "id": "240010" },
        { "name": "尾鷲", "id": "240020" },
        { "name": "大津", "id": "250010" },
        { "name": "彦根", "id": "250020" },
        { "name": "京都", "id": "260010" },
        { "name": "舞鶴", "id": "260020" },
        { "name": "大阪", "id": "270000" },
        { "name": "神戸", "id": "280010" },
        { "name": "豊岡", "id": "280020" },
        { "name": "奈良", "id": "290010" },
        { "name": "風屋", "id": "290020" },
        { "name": "和歌山", "id": "300010" },
        { "name": "潮岬", "id": "300020" },
      ],
      "中国・四国": [  // 13+9個
        { "name": "鳥取", "id": "310010" },
        { "name": "米子", "id": "310020" },
        { "name": "松江", "id": "320010" },
        // { "name": "浜田", "id": "320020" },
        // { "name": "西郷", "id": "320030" },
        { "name": "岡山", "id": "330010" },
        // { "name": "津山", "id": "330020" },
        { "name": "広島", "id": "340010" },
        // { "name": "庄原", "id": "340020" },
        { "name": "下関", "id": "350010" },
        { "name": "山口", "id": "350020" },
        // { "name": "柳井", "id": "350030" },
        { "name": "萩", "id": "350040" },
        { "name": "徳島", "id": "360010" },
        // { "name": "日和佐", "id": "360020" },
        { "name": "高松", "id": "370000" },
        { "name": "松山", "id": "380010" },
        // { "name": "新居浜", "id": "380020" },
        // { "name": "宇和島", "id": "380030" },
        { "name": "高知", "id": "390010" },
        { "name": "室戸岬", "id": "390020" },
        // { "name": "清水", "id": "390030" },
      ],
      // "四国": [  // 9個
      //   { "name": "徳島", "id": "360010" },
      //   { "name": "日和佐", "id": "360020" },
      //   { "name": "高松", "id": "370000" },
      //   { "name": "松山", "id": "380010" },
      //   { "name": "新居浜", "id": "380020" },
      //   { "name": "宇和島", "id": "380030" },
      //   { "name": "高知", "id": "390010" },
      //   { "name": "室戸岬", "id": "390020" },
      //   { "name": "清水", "id": "390030" },
      // ],
      "九州": [  // 33個
        { "name": "福岡", "id": "400010" },
        { "name": "八幡", "id": "400020" },
        // { "name": "飯塚", "id": "400030" },
        // { "name": "久留米", "id": "400040" },
        { "name": "佐賀", "id": "410010" },
        // { "name": "伊万里", "id": "410020" },
        { "name": "長崎", "id": "420010" },
        // { "name": "佐世保", "id": "420020" },
        // { "name": "厳原", "id": "420030" },
        // { "name": "福江", "id": "420040" },  // 「島々」に移動
        { "name": "熊本", "id": "430010" },
        { "name": "阿蘇乙姫", "id": "430020" },
        // { "name": "牛深", "id": "430030" },
        { "name": "人吉", "id": "430040" },
        { "name": "大分", "id": "440010" },
        // { "name": "中津", "id": "440020" },
        { "name": "日田", "id": "440030" },
        // { "name": "佐伯", "id": "440040" },
        { "name": "宮崎", "id": "450010" },
        { "name": "延岡", "id": "450020" },
        // { "name": "都城", "id": "450030" },
        { "name": "高千穂", "id": "450040" },
        { "name": "鹿児島", "id": "460010" },
        // { "name": "鹿屋", "id": "460020" },
        // { "name": "種子島", "id": "460030" },  // この9つは「島々」に移動
        // { "name": "名瀬", "id": "460040" },
        // { "name": "那覇", "id": "471010" },
        // { "name": "名護", "id": "471020" },
        // { "name": "久米島", "id": "471030" },
        // { "name": "南大東", "id": "472000" },
        // { "name": "宮古島", "id": "473000" },
        // { "name": "石垣島", "id": "474010" },
        // { "name": "与那国島", "id": "474020" },
      ],
      "島々": [  //13個
        { "name": "大島", "id": "130020" },
        { "name": "八丈島", "id": "130030" },
        { "name": "父島", "id": "130040" },
        { "name": "福江（五島列島）", "id": "420040" },
        { "name": "種子島", "id": "460030" },
        { "name": "名瀬", "id": "460040" },
        { "name": "那覇", "id": "471010" },
        { "name": "名護", "id": "471020" },
        { "name": "久米島", "id": "471030" },
        { "name": "南大東", "id": "472000" },
        { "name": "宮古島", "id": "473000" },
        { "name": "石垣島", "id": "474010" },
        { "name": "与那国島", "id": "474020" },
      ]

    }

    const cityArray = [];


    if (w_data === "survey1") {
      let i = 0;
      for (const cityObject of cityIds2[w_area]) {
        cityArray.push(`{
          "type": "action",
          "action": {
            "type": "postback",
            "label": \`${cityObject["name"]}\`,
            "data": \`data=survey2&area=${w_area}&item=${i}\`,
            "displayText": \`${cityObject["name"]}\`
          }
        }`)
        i++;
      }
      console.log(cityArray);

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