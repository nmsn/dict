import * as koa from "koa";
import * as bodyParser from "koa-bodyparser";
import { createConnection } from "typeorm";
import * as cors from "@koa/cors";
import router from "./src/router";

const app = new koa();

app.use(cors());
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});
app.use(bodyParser());
app.use(router.routes());


createConnection();

app.listen(3000);

console.log("app started at port 3000...");
