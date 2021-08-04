import axios from "axios";
import * as qs from "qs";
import * as md5 from "crypto-js/md5";
import * as sha256 from "crypto-js/sha256";
import { baiduConfig, youdaoConfig } from "../../config.local.js";

// import { Context } from "koa";

const baiduParams = {
  url: "https://fanyi-api.baidu.com/api/trans/vip/translate",
  from: "en",
  to: "zh",
  appid: baiduConfig.APP_ID,
  salt: baiduConfig.SALT,
  key: baiduConfig.KEY,
};

const getBaiduUrl = (word: string) => {
  const q = word;

  const { url, from, to, appid, salt, key } = baiduParams;
  const sign = md5(`${appid}${q}${salt}${key}`).toString();
  const qsBody = qs.stringify({
    q,
    from,
    to,
    appid,
    salt,
    sign,
  });

  return `${url}?${qsBody}`;
};

const youdaoParams = {
  url: "https://openapi.youdao.com/api",
  from: "en",
  to: "zh-CHS",
  appKey: youdaoConfig.APP_ID,
  salt: youdaoConfig.SALT,
  key: youdaoConfig.KEY,
  signType: "v3",
};

const getYoudaoUrl = (word: string) => {
  const q = word;
  const now = Math.round(new Date().getTime() / 1000);
  const { url, from, to, appKey, salt, key, signType } = youdaoParams;

  const input =
    q.length > 20
      ? `${q.substring(0, 10)}${q.length}${q.substring(
          q.length - 10,
          q.length,
        )}`
      : q;
  const sign = sha256(`${appKey}${input}${salt}${now}${key}`).toString();

  const params = {
    q,
    from,
    to,
    appKey,
    salt,
    sign,
    signType,
    curtime: now,
  };

  console.log(params);

  const qsBody = qs.stringify(params);

  return `${url}?${qsBody}`;
};

export default class DictController {
  async getBaiduDict(ctx, next) {
    const { word } = ctx.params;

    const fullUrl = getBaiduUrl(word);

    try {
      const { status, data } = await axios.get(`${fullUrl}`);
      const {
        trans_result: [{ src, dst }],
      } = data;
      ctx.response.body = data;
    } catch (e) {
      ctx.response.body = e;
    }
  }

  async getYoudaoDict(ctx, next) {
    const { word } = ctx.params;

    const fullUrl = getYoudaoUrl(word);

    try {
      const { status, data } = await axios.get(`${fullUrl}`);
      ctx.response.body = data;
    } catch (e) {
      ctx.response.body = e;
    }
  }
}
