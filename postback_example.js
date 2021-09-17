// 固定値
let channel_token = "****************************************"
let url = "https://api.line.me/v2/bot/message/reply"
let spreadsheet = SpreadsheetApp.openById("****************************************");
let sheet_userlist = spreadsheet.getSheetByName('userlist');

// LINEからのイベントがdoPostにとんでくる
function doPost(e) {
  // とんできた情報を扱いやすいように変換している
  let json = e.postData.contents;
  let events = JSON.parse(json).events;
  let dat = sheet_userlist.getDataRange().getValues(); // 受け取ったシートのデータを二次元配列に取得

  // とんできたイベントの種類を確認する
  events.forEach(function (event) {

    // ユーザーIDとユーザー名を取得
    let userId = event.source.userId;
    let json = UrlFetchApp.fetch("https://api.line.me/v2/bot/profile/" + userId, { "headers": { "Authorization": "Bearer " + channel_token } });
    let displayName = JSON.parse(json).displayName;

    // スプレッドシートに書き込む
    for (let i = 1; i < dat.length; i++) {
      if (dat[i][0] == userId) {
        break;
      }
    }
    if (i == dat.length) {
      sheet_userlist.appendRow([userId, displayName]);
    }


    // もしイベントの種類がトークによるテキストメッセージだったら
    if (event.type == "message") {
      if (event.message.type == "text") {

        // 自動返信メッセージの内容
        let message = {
          "replyToken": event.replyToken,
          "messages": [{ "type": "text", "text": "こちらはbotによる自動返信です。" }]
        };
        // メッセージに添えなければならない情報
        let options = {
          "method": "post",
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + channel_token
          },
          "payload": JSON.stringify(message)
        };

        // 自動返信メッセージを送信する
        UrlFetchApp.fetch(url, options);
      }
    }
    else if (event.type == "postback") {
      let w_data = event.postback.data.split("&")[0].replace("data=", "");// 質問の内容を一時格納
      let w_item = event.postback.data.split("&")[1].replace("item=", "");// 回答を一時格納
      // 性別の回答がきたら
      if (w_data == "survey1") {
        sheet_userlist.getRange(i + 1, 3).setValue(w_item);// スプレッドシートに性別の回答を入力
        survey_age(event);// 年齢の質問をリプライメッセージ送信
      }
      else if (w_data == "survey2") {
        sheet_userlist.getRange(i + 1, 4).setValue(w_item);// スプレッドシートに年代の回答を入力
        survey_end(event);// アンケートありがとうのリプライメッセージ送信
      }
    }
  })
}

function survey_demogra() {
  let sheet = SpreadsheetApp.openById("****************************************");
  let ss = sheet.getSheetByName('userlist');
  let dat = ss.getDataRange().getValues(); // 受け取ったシートのデータを二次元配列に取得
  for (let i = 1; i < dat.length; i++) {
    push_survey(dat[i][0])
  }
}

function push_survey(userId) {
  let url = "https://api.line.me/v2/bot/message/push";
  let headers = {
    "Content-Type": "application/json; charset=UTF-8",
    'Authorization': 'Bearer ' + channel_token,
  };
  let postData = {
    "to": userId,
    // ★★★messages配信内容★★★
    'messages': [
      {
        "type": "text", "text": "こんにちは。サービス品質向上のため、あなたの性別と年齢をお聞かせください。\nまずは性別を選択してください。",
        "quickReply": {
          "items": [
            {
              "type": "action",
              "action": {
                "type": "postback",
                "label": "男性",
                "data": "data=survey1&item=男性",
                "displayText": "男性"
              }
            },
            {
              "type": "action",
              "action": {
                "type": "postback",
                "label": "女性",
                "data": "data=survey1&item=女性",
                "displayText": "女性"
              }
            }
          ]
        }
      }
    ]
    // ★★★messages配信内容 end★★★
  }
  let options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(postData)
  };

  return UrlFetchApp.fetch(url, options);
}

function survey_age(event) {
  let message = {
    "replyToken": event.replyToken,
    // ★★★messages配信内容★★★
    'messages': [
      {
        "type": "text", "text": "年齢層を選択してください。",
        "quickReply": {
          "items": [
            {
              "type": "action",
              "action": {
                "type": "postback",
                "label": "20歳未満",
                "data": "data=survey2&item=20歳未満",
                "displayText": "20歳未満"
              }
            },
            {
              "type": "action",
              "action": {
                "type": "postback",
                "label": "20代",
                "data": "data=survey2&item=20代",
                "displayText": "20代"
              }
            },
            {
              "type": "action",
              "action": {
                "type": "postback",
                "label": "30代",
                "data": "data=survey2&item=30代",
                "displayText": "30代"
              }
            },
            {
              "type": "action",
              "action": {
                "type": "postback",
                "label": "40代",
                "data": "data=survey2&item=40代",
                "displayText": "40代"
              }
            },
            {
              "type": "action",
              "action": {
                "type": "postback",
                "label": "50代",
                "data": "data=survey2&item=50代",
                "displayText": "50代"
              }
            },
            {
              "type": "action",
              "action": {
                "type": "postback",
                "label": "60歳以上",
                "data": "data=survey2&item=60歳以上",
                "displayText": "60歳以上"
              }
            }
          ]
        }
      }
    ]
    // ★★★messages配信内容 end★★★
  };
  // メッセージに添えなければならない情報
  let options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + channel_token
    },
    "payload": JSON.stringify(message)
  };

  // 自動返信メッセージを送信する
  UrlFetchApp.fetch(url, options);
}

function survey_end(event) {
  let message = {
    "replyToken": event.replyToken,
    // ★★★messages配信内容★★★
    'messages': [
      { "type": "text", "text": "アンケートのご協力ありがとうございました。" }
    ]
    // ★★★messages配信内容 end★★★
  };
  // メッセージに添えなければならない情報
  let options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + channel_token
    },
    "payload": JSON.stringify(message)
  };

  // 自動返信メッセージを送信する
  UrlFetchApp.fetch(url, options);
}