import axios from "axios";
import * as qs from "qs";
import * as md5 from "crypto-js/md5";
import * as sha256 from "crypto-js/sha256";
import { baiduConfig, youdaoConfig } from "../../config.local";
import DictService from "../service/dict";
import { EOVERFLOW } from "constants";

const dictService = new DictService();

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

  const qsBody = qs.stringify(params);

  return `${url}?${qsBody}`;
};

const getFullUrl = (type: "baidu" | "youdao", word: string) => {
  return type === "baidu" ? getBaiduUrl(word) : getYoudaoUrl(word);
};

const reqBaidu = async (ctx: any, fullUrl: string) => {
  try {
    const { status, data } = await axios.get(`${fullUrl}`);
    const {
      from,
      to,
      trans_result: [{ src, dst }],
    } = data;
    dictService.save({
      type: "baidu",
      from,
      to,
      query: src,
      translation: dst,
      time: new Date(),
    });
    ctx.response.body = data;
  } catch (e) {
    ctx.response.body = e;
  }
};

const getBaiduWord = async (fullUrl: string) => {
  try {
    const { status, data } = await axios.get(`${fullUrl}`);
    const {
      from,
      to,
      trans_result: [{ src, dst }],
    } = data;

    const result = {
      type: "baidu",
      from,
      to,
      query: src,
      translation: dst,
      time: new Date(),
    };

    dictService.save(result);

    return result;
  } catch (e) {
    return e;
  }
};

const reqYoudao = async (ctx: any, fullUrl: string) => {
  try {
    const { status, data } = await axios.get(`${fullUrl}`);
    const { query, translation, l, webdict } = data;

    const [from, to] = l.split("2");
    dictService.save({
      type: "youdao",
      from,
      to,
      query,
      translation: translation.join(","),
      time: new Date(),
      link: webdict.url,
    });
    ctx.response.body = data;
  } catch (e) {
    ctx.response.body = e;
  }
};

const getYoudaoWord = async (fullUrl: string) => {
  try {
    const { status, data } = await axios.get(`${fullUrl}`);
    const { query, translation, l, webdict } = data;

    const [from, to] = l.split("2");
    const result = {
      type: "youdao",
      from,
      to,
      query,
      translation: translation.join(","),
      time: new Date(),
      link: webdict.url,
    };
    dictService.save(result);
    return result;
  } catch (e) {
    return e;
  }
};

export default class DictController {
  async getBaiduDict(ctx, next) {
    const { word } = ctx.params;
    await reqBaidu(ctx, getFullUrl("baidu", word));
  }

  async getYoudaoDict(ctx, next) {
    const { word } = ctx.params;
    await reqYoudao(ctx, getFullUrl("youdao", word));
  }

  async getWord(ctx, next) {
    const { word } = ctx.request.body;
    try {
      const [youdao, baidu] = await Promise.all([
        getYoudaoWord(getFullUrl("youdao", word)),
        getBaiduWord(getFullUrl("baidu", word)),
      ]);
      ctx.success([youdao, baidu]);
    } catch (e) {
      ctx.fail("Request Failed", 404);
    }
  }

  async findAll(ctx, next) {
    try {
      ctx.response.body = await dictService.findAll();
    } catch (e) {
      ctx.response.body = e;
    }
  }
  
  async findAllCurMonth(ctx, next) {
    try {
      ctx.response.body = await dictService.findAllCurMonth();
    } catch (e) {
      ctx.response.body = e;
    }
  }
  
  async findAllCurWeek(ctx, next) {
    try {
      ctx.response.body = await dictService.findAllCurWeek();
    } catch (e) {
      ctx.response.body = e;
    }
  }
  
  async findAllType(ctx, next) {
    try {
      const { type } = ctx.params;
      ctx.response.body = await dictService.findAllType(type);
    } catch (e) {
      ctx.response.body = e;
    }
  }
  
  async findGroup(ctx, next) {
    try {
      const { type } = ctx.params;
      ctx.response.body = await dictService.findGroup();
    } catch (e) {
      ctx.response.body = e;
    }
  }
}
