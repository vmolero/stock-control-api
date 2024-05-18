import { Hono } from "hono";
import CryptoService from "./services/CryptoService.ts";

const api = new Hono();
const crypto = CryptoService.createCryptoService();

api.get("/", async (c) => {
  const helloMessage = await crypto.encrypt("Hello Hono!");
  return c.text(`${helloMessage} => ${await crypto.decrypt(helloMessage)}`);
});

export default api;
