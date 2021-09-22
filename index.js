"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var cityIds2;
var areaArray = [];
var areaReplyItems = [];
fs.readFile('./data.json', 'utf8', function (err, data) {
    if (err)
        throw err;
    cityIds2 = JSON.parse(data);
    areaArray = Object.keys(cityIds2);
    areaReplyItems = areaArray.map(function (area) {
        return {
            "type": "action",
            "action": {
                "type": "postback",
                "label": area,
                "data": "data=survey1&area=" + area,
                "displayText": area
            }
        };
    });
});
var bot_sdk_1 = require("@line/bot-sdk");
var express = __importStar(require("express"));
var axios_1 = __importDefault(require("axios"));
// create LINE SDK config from env variables
var clientConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET,
};
var middlewareConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET || '',
};
// create LINE SDK client
var client = new bot_sdk_1.Client(clientConfig);
// create Express app
// about Express itself: https://expressjs.com/
var app = express.default();
// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/webhook", (0, bot_sdk_1.middleware)(middlewareConfig), function (req, res) {
    Promise
        .all(req.body.events.map(handleEvent))
        .then(function (result) { return res.json(result); })
        .catch(function (err) {
        console.error(err);
        res.status(500).end();
    });
});
// event handler
function handleEvent(event) {
    return __awaiter(this, void 0, void 0, function () {
        var w_data, w_area, cityArray, i, _i, _a, cityObject, newObj, w_item, cityIndex, CITY_ID, URL_1, res, description, replyText;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(event.type === "message")) return [3 /*break*/, 1];
                    return [2 /*return*/, client.replyMessage(event.replyToken, {
                            "type": "text",
                            "text": "地方を選んでね",
                            "quickReply": {
                                "items": areaReplyItems
                            }
                        })];
                case 1:
                    if (!(event.type === "postback")) return [3 /*break*/, 4];
                    w_data = event.postback.data.split("&")[0].replace("data=", "");
                    w_area = event.postback.data.split("&")[1].replace("area=", "");
                    cityArray = [];
                    if (!(w_data === "survey1")) return [3 /*break*/, 2];
                    i = 0;
                    for (_i = 0, _a = cityIds2[w_area]; _i < _a.length; _i++) {
                        cityObject = _a[_i];
                        newObj = {
                            "type": "action",
                            "action": {
                                "type": "postback",
                                "label": cityObject["name"],
                                "data": "data=survey2&area=" + w_area + "&item=" + i,
                                "displayText": cityObject["name"]
                            }
                        };
                        cityArray.push(newObj);
                        i++;
                    }
                    client.replyMessage(event.replyToken, {
                        "type": "text",
                        "text": "地名を選んでね",
                        "quickReply": {
                            "items": cityArray
                        }
                    });
                    return [3 /*break*/, 4];
                case 2:
                    if (!(w_data === "survey2")) return [3 /*break*/, 4];
                    w_item = event.postback.data.split("&")[2].replace("item=", "");
                    cityIndex = parseInt(w_item);
                    CITY_ID = cityIds2[w_area][cityIndex]["id"];
                    URL_1 = "https://weather.tsukumijima.net/api/forecast?city=" + CITY_ID;
                    return [4 /*yield*/, axios_1.default.get(URL_1)];
                case 3:
                    res = _b.sent();
                    description = res.data.description;
                    replyText = description.bodyText;
                    return [2 /*return*/, client.replyMessage(event.replyToken, {
                            type: "text",
                            text: replyText,
                        })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// listen on port
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("listening on " + port);
});
