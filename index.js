const Koa = require("koa");
const { baiduConfig, youdaoConfig } = require("./config.local.js");

const router = require("koa-router")();
const bodyParser = require("koa-bodyparser");
const md5 = require("crypto-js/md5");
const sha256 = require("crypto-js/sha256");
const axios = require("axios");
const qs = require("qs");

const app = new Koa();

app.use(bodyParser());
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

const baiduParams = {
  url: "https://fanyi-api.baidu.com/api/trans/vip/translate",
  from: "en",
  to: "zh",
  appid: baiduConfig.APP_ID,
  salt: baiduConfig.SALT,
  key: baiduConfig.KEY,
};

const getBaiduUrl = (word) => {
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

const getYoudaoUrl = (word) => {
  const q = word;
  const now = Math.round(new Date().getTime()/1000);
  const { url, from, to, appKey, salt, key, signType } = youdaoParams;

  const input =
    q?.length > 20
      ? `${q.substring(0, 10)}${q.length}${q.q.substring(
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

router.get("/baidu/:word", async (ctx, next) => {
  const { word } = ctx.params;

  const fullUrl = getBaiduUrl(word);

  try {
    const { status, data } = await axios.get(`${fullUrl}`);
    const {
      trans_result: [{ src, dst }],
    } = data;
    ctx.response.body = `<h2>Translation result: </h2><h2>${dst}</h2>`;
  } catch (e) {
    ctx.response.body = e;
  }
});

router.get("/youdao/:word", async (ctx, next) => {
  const { word } = ctx.params;

  const fullUrl = getYoudaoUrl(word);

  try {
    const { status, data } = await axios.get(`${fullUrl}`);
    // console.log(data);
    // const {
    //   trans_result: [{ src, dst }],
    // } = data;
    ctx.response.body = data;
  } catch (e) {
    ctx.response.body = e;
  }
});

router.get("/", async (ctx, next) => {
  ctx.response.body = "<h1>dict</h1>";
});

app.use(router.routes());

app.listen(3000);

console.log("app started at port 3000...");
