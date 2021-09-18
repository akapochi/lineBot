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
              "data": "data=survey1&item=北海道",
              "displayText": "北海道"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "東北",
              "data": "data=survey1&item=東北",
              "displayText": "東北"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "関東",
              "data": "data=survey1&item=関東",
              "displayText": "関東"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "中部",
              "data": "data=survey1&item=中部",
              "displayText": "中部"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "近畿",
              "data": "data=survey1&item=近畿",
              "displayText": "近畿"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "中国",
              "data": "data=survey1&item=中国",
              "displayText": "中国"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "四国",
              "data": "data=survey1&item=四国",
              "displayText": "四国"
            }
          },
          {
            "type": "action",
            "action": {
              "type": "postback",
              "label": "九州",
              "data": "data=survey1&item=九州",
              "displayText": "九州"
            }
          },
        ]
      }
    }
    )
  } else if (event.type === "postback") {
    const w_data = event.postback.data.split("&")[0].replace("data=", ""); // 質問の種類を一時格納
    const w_area = event.postback.data.split("&")[1].replace("area=", ""); // 地方を一時格納（数字）
    const w_item = event.postback.data.split("&")[2].replace("item=", ""); // 地名を一時格納（数字）

    // const cityName = w_item;
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
      "北海道": [
        "011000",
        "012010",
        "012020",
        "013010",
        "013020",
        "013030",
        "014010",
        "014020",
        "014030",
        "015010",
        "015020",
        "016010",
        "016020",
        "016030",
        "017010",
        "017020",
      ],
      "東北": [
        "020010",
        "020020",
        "020030",
        "030010",
        "030020",
        "030030",
        "040010",
        "040020",
        "050010",
        "050020",
        "060010",
        "060020",
        "060030",
        "060040",
        "070010",
        "070020",
        "070030",
      ],
      "関東": [
        "080010",
        "080020",
        "090010",
        "090020",
        "100010",
        "100020",
        "110010",
        "110020",
        "110030",
        "120010",
        "120020",
        "120030",
        "130010",
        "130020",
        "130030",
        "130040",
        "140010",
        "140020",
      ],
      "中部": [
        "150010",
        "150020",
        "150030",
        "150040",
        "160010",
        "160020",
        "170010",
        "170020",
        "180010",
        "180020",
        "190010",
        "190020",
        "200010",
        "200020",
        "200030",
        "210010",
        "210020",
        "220010",
        "220020",
        "220030",
        "220040",
        "230010",
        "230020",
      ],
      "近畿": [
        "240010",
        "240020",
        "250010",
        "250020",
        "260010",
        "260020",
        "270000",
        "280010",
        "280020",
        "290010",
        "290020",
        "300010",
        "300020",
      ],
      "中国": [
        "310010",
        "310020",
        "320010",
        "320020",
        "320030",
        "330010",
        "330020",
        "340010",
        "340020",
        "350010",
        "350020",
        "350030",
        "350040",
      ],
      "四国": [
        "360010",
        "360020",
        "370000",
        "380010",
        "380020",
        "380030",
        "390010",
        "390020",
        "390030",
      ],
      "九州": [
        "400010",
        "400020",
        "400030",
        "400040",
        "410010",
        "410020",
        "420010",
        "420020",
        "420030",
        "420040",
        "430010",
        "430020",
        "430030",
        "430040",
        "440010",
        "440020",
        "440030",
        "440040",
        "450010",
        "450020",
        "450030",
        "450040",
        "460010",
        "460020",
        "460030",
        "460040",
        "471010",
        "471020",
        "471030",
        "472000",
        "473000",
        "474010",
        "474020"
      ]

    }
    // const CITY_ID = cityIds[cityName];


    if (w_data === "survey1") {
      if (w_area === "0") {
        client.replyMessage(event.replyToken, {
          "type": "text",
          "text": "地名を選んでね",
          "quickReply": {
            "items": [
              {
                "type": "action",
                "action": {
                  "type": "postback",
                  "label": `${cityIds2[北海道][0]}`,
                  "data": "data=survey2&area=0&item=0",
                  "displayText": `${cityIds2[北海道][0]}`
                }
              },
              {
                "type": "action",
                "action": {
                  "type": "postback",
                  "label": "旭川",
                  "data": "data=survey2&area=0&item=1",
                  "displayText": "旭川"
                }
              },
              {
                "type": "action",
                "action": {
                  "type": "postback",
                  "label": "留萌",
                  "data": "data=survey2&area=0&item=2",
                  "displayText": "留萌"
                }
              },
              {
                "type": "action",
                "action": {
                  "type": "postback",
                  "label": "網走",
                  "data": "data=survey2&area=0&item=3",
                  "displayText": "網走"
                }
              },
              {
                "type": "action",
                "action": {
                  "type": "postback",
                  "label": "北見",
                  "data": "data=survey2&area=0&item=4",
                  "displayText": "北見"
                }
              },
              {
                "type": "action",
                "action": {
                  "type": "postback",
                  "label": "紋別",
                  "data": "data=survey2&area=0&item=5",
                  "displayText": "紋別"
                }
              },
              {
                "type": "action",
                "action": {
                  "type": "postback",
                  "label": "根室",
                  "data": "data=survey2&area=0&item=6",
                  "displayText": "根室"
                }
              },
              {
                "type": "action",
                "action": {
                  "type": "postback",
                  "label": "釧路",
                  "data": "data=survey2&area=0&item=7",
                  "displayText": "釧路"
                }
              },
            ]
          }
        }
        )
      } else if (w_area === "1") {

      }
    } else if (w_data === "survey2") {
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