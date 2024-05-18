import { Hono } from "hono";

const api = new Hono();

api.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default api;