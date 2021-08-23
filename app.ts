import * as koa from "koa";
import * as bodyParser from "koa-bodyparser";
import { createConnection } from "typeorm";
import * as cors from "@koa/cors";
import router from "./src/router";
import uniteResponse from './src/middleware/uniteResponse';

const app = new koa();

app.use(cors());
app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
  console.log(ctx);
});
app.use(bodyParser());
app.use(uniteResponse());
app.use(router.routes());


createConnection();

app.listen(3000);

console.log("app started at port 3000...");
