const Koa = require("koa");
const config = require("./config.js.local");

const router = require("koa-router")();
const bodyParser = require("koa-bodyparser");
const md5 = require("crypto-js/md5");
const axios = require("axios");
const qs = require("qs");

const { KEY, SALT } = config;

const app = new Koa();

app.use(bodyParser());
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

// app.use(async ctx => {
//   ctx.body = 'Hello World';
// });

// app.use(async (ctx, next) => {
//   console.log(ctx.request);
//   if (ctx.request.path === '/') {
//       ctx.response.body = 'index page';
//   } else {
//       await next();
//   }
// });

router.get("/hello/:name", async (ctx, next) => {
  var name = ctx.params.name;
  ctx.response.body = `<h1>Hello, ${name}!</h1>`;
});

router.get("/dict/:word", async (ctx, next) => {
  var word = ctx.params.word;

  const url = "http://api.fanyi.baidu.com/api/trans/vip/translate";
  const q = word;
  const from = "en";
  const to = "zh";
  const appid = "20210716000889789";
  const salt = SALT;
  const key = KEY;
  const sign = md5(`${appid}${q}${salt}${key}`);

  const qsBody = qs.stringify({
    q,
    from,
    to,
    appid,
    salt,
    sign,
  });

  const fullUrl = `${url}?${qsBody}`;
  console.log(fullUrl);
  var data = await axios.get(`${fullUrl}`);
  console.log(data);
  ctx.response.body = `<h1>Hello, ${word}!</h1>`;
});

router.get("/", async (ctx, next) => {
  ctx.response.body = "<h1>Index</h1>";
});

app.use(router.routes());

app.listen(3000);

console.log("app started at port 3000...");
