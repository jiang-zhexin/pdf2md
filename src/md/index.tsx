import { Hono } from "hono";
import { stream } from "hono/streaming";
import { OCRResponse$inboundSchema } from "@mistralai/mistralai/models/components";
import { createTar } from "../../utils/createTar";

const md = new Hono<{ Bindings: Env }>().basePath("/md");

md.get("/:id", async (c) => {
  const id = c.req.param("id");
  const aiLog = await c.env.AI.gateway("pdf2md").getLog(id);
  const ocrResponse = OCRResponse$inboundSchema.parse(
    JSON.parse(aiLog.response_head!)
  );
  c.header("Content-Disposition", `attachment; filename="${id}.tar"`);

  const tar = createTar(ocrResponse, id);
  return stream(c, async (stream) => {
    await stream.pipe(tar);
  });
});

export default md;
