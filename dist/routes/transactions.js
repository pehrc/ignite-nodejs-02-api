"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/transactions.ts
var transactions_exports = {};
__export(transactions_exports, {
  transactionsRoutes: () => transactionsRoutes
});
module.exports = __toCommonJS(transactions_exports);
var import_zod2 = require("zod");
var import_node_crypto = __toESM(require("crypto"));

// src/database.ts
var import_knex = require("knex");

// src/env/index.ts
var import_dotenv = require("dotenv");
var import_zod = require("zod");
if (process.env.NODE_ENV === "test") {
  (0, import_dotenv.config)({ path: ".env.test" });
} else {
  (0, import_dotenv.config)();
}
var envSchema = import_zod.z.object({
  DATABASE_URL: import_zod.z.string(),
  DATABASE_CLIENT: import_zod.z.enum(["sqlite", "pg"]),
  PORT: import_zod.z.coerce.number().default(3333),
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("production")
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid enviroment variables!", _env.error.format());
  throw new Error("Invalid enviroment variables!");
}
var env = _env.data;

// src/database.ts
var config2 = {
  client: env.DATABASE_CLIENT,
  connection: env.DATABASE_CLIENT === "sqlite" ? {
    filename: env.DATABASE_URL
  } : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    directory: "./db/migrations",
    extension: "ts"
  }
};
var knex = (0, import_knex.knex)(config2);

// src/middleware/check-session-id-exists.ts
async function checkSessionIdExists(req, res) {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    return res.status(401).send({
      error: "Unauthorized"
    });
  }
}

// src/routes/transactions.ts
async function transactionsRoutes(app) {
  app.get("/", { preHandler: [checkSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies;
    const transactions = await knex("transactions").where("session_id", sessionId).select("*");
    return { transactions };
  });
  app.get("/all", async () => {
    const transactions = await knex("transactions").select("*");
    return { transactions };
  });
  app.get("/summary/all", async () => {
    const summary = await knex("transactions").sum("amount", { as: "amount" }).first();
    return { summary };
  });
  app.get("/:id", { preHandler: [checkSessionIdExists] }, async (req) => {
    const getTransactionParamsSchema = import_zod2.z.object({
      id: import_zod2.z.string().uuid()
    });
    const { sessionId } = req.cookies;
    const { id } = getTransactionParamsSchema.parse(req.params);
    const transaction = await knex("transactions").where("id", id).andWhere("session_id", sessionId).first();
    return { transaction };
  });
  app.get("/summary", { preHandler: [checkSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies;
    const summary = await knex("transactions").where("session_id", sessionId).sum("amount", { as: "amount" }).first();
    console.log(summary);
    return { summary };
  });
  app.post("/", async (req, res) => {
    const createTransactionBodySchema = import_zod2.z.object({
      title: import_zod2.z.string(),
      amount: import_zod2.z.number(),
      type: import_zod2.z.enum(["credit", "debit"])
    });
    const { title, amount, type } = createTransactionBodySchema.parse(req.body);
    let sessionId = req.cookies.session_id;
    if (!sessionId) {
      sessionId = import_node_crypto.default.randomUUID();
      res.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1e3 * 60 * 60 * 24 * 1
        // 1 day
      });
    }
    await knex("transactions").insert({
      id: import_node_crypto.default.randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId
    });
    return res.status(201).send("");
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  transactionsRoutes
});
