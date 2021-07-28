const Koa = require("koa");
const config = require("./config.local.js");

const router = require("koa-router")();
const bodyParser = require("koa-bodyparser");
const md5 = require("crypto-js/md5");
const axios = require("axios");
const qs = require("qs");

const { APP_ID, KEY, SALT } = config;

const app = new Koa();

app.use(bodyParser());
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

const url = "https://fanyi-api.baidu.com/api/trans/vip/translate";
const from = "en";
const to = "zh";
const appid = APP_ID;
const salt = SALT;
const key = KEY;

const getUrl = (word) => {
  const q = word;
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

router.get("/dict/:word", async (ctx, next) => {
  const { word } = ctx.params;

  const fullUrl = getUrl(word);

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

router.get("/", async (ctx, next) => {
  ctx.response.body = "<h1>dict</h1>";
});

app.use(router.routes());

app.listen(3000);

console.log("app started at port 3000...");
