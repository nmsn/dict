import * as koa from "koa";
import * as bodyParser from "koa-bodyparser";
import { createConnection, getConnection, getRepository  } from "typeorm";
import router from "./src/router";

const app = new koa();

app.use(bodyParser());
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

createConnection();

app.use(router.routes());

app.listen(3000);

console.log("app started at port 3000...");
