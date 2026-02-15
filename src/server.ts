import { createServer } from "node:http";
import { handleRequest } from "./app.js";

const port = Number(process.env.PORT ?? 8787);

createServer((req, res) => {
  void handleRequest(req, res);
}).listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`webmcp-playground server listening on http://localhost:${port}`);
});
