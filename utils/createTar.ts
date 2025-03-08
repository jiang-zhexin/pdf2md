import { decodeBase64 } from "@std/encoding";
import { TarStream, type TarStreamInput } from "@std/tar/tar-stream";
import type { OCRResponse } from "@mistralai/mistralai/models/components";

export function createTar(ocrResponse: OCRResponse, name: string) {
  const markdown = ocrResponse.pages.map((p) => p.markdown).join("\n\n");
  const images = ocrResponse.pages.map((p) => p.images).flat(2);

  const tar = new ReadableStream<TarStreamInput>({
    start(controller) {
      const mdArray = new TextEncoder().encode(markdown);
      controller.enqueue({
        type: "file",
        path: `${name}.md`,
        size: mdArray.length,
        readable: createReadableStream(mdArray),
      });

      for (const image of images) {
        if (!image.imageBase64) continue;
        const imageArray = decodeBase64(
          image.imageBase64.replace("data:image/jpeg;base64,", ""),
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

  return tar;
}

function createReadableStream<T extends ArrayBufferLike>(
  u: Uint8Array<T>,
): ReadableStream<Uint8Array<T>> {
  return new ReadableStream<Uint8Array<T>>({
    start(controller) {
      controller.enqueue(u);
      controller.close();
    },
  });
}
