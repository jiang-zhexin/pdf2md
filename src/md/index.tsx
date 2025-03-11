import { Hono } from "hono";
import { stream } from "hono/streaming";
import { decodeBase64 } from "@std/encoding";
import { OCRResponse$inboundSchema } from "@mistralai/mistralai/models/components";
import { TarStream, type TarStreamInput } from "@std/tar/tar-stream";

const md = new Hono<{ Bindings: Env }>().basePath("/md");

md.get("/:id", async (c) => {
  const id = c.req.param("id");
  const aiLog = await c.env.AI.gateway("pdf2md").getLog(id);
  const ocrResponse = OCRResponse$inboundSchema.parse(
    JSON.parse(aiLog.response_head!)
  );
  const markdown = ocrResponse.pages.map((p) => p.markdown).join("\n\n");
  const images = ocrResponse.pages.map((p) => p.images).flat(2);

  const tar = new ReadableStream<TarStreamInput>({
    start(controller) {
      const mdArray = new TextEncoder().encode(markdown);
      controller.enqueue({
        type: "file",
        path: `${id}.md`,
        size: mdArray.length,
        readable: createReadableStream(mdArray),
      });

      for (const image of images) {
        if (!image.imageBase64) continue;
        const imageArray = decodeBase64(
          image.imageBase64.replace("data:image/jpeg;base64,", "")
        );
        controller.enqueue({
          type: "file",
          path: image.id,
          size: imageArray.length,
          readable: createReadableStream(imageArray),
        });
      }

      controller.close();
    },
  }).pipeThrough(new TarStream());

  c.header("Content-Disposition", `attachment; filename="${id}.tar"`);

  return stream(c, async (stream) => {
    stream.onAbort(() => {
      console.log("Aborted!");
    });
    await stream.pipe(tar);
  });
});

export default md;

function createReadableStream<T extends ArrayBufferLike>(
  u: Uint8Array<T>
): ReadableStream<Uint8Array<T>> {
  return new ReadableStream<Uint8Array<T>>({
    start(controller) {
      controller.enqueue(u);
      controller.close();
    },
  });
}
