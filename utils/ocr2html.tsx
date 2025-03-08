import { OCRResponse } from "@mistralai/mistralai/models/components";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import markedFootnote from "marked-footnote";

marked.use(markedFootnote());
marked.use(
  markedKatex({
    throwOnError: false,
    nonStandard: true,
    output: "mathml",
  })
);
marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
});

export async function Ocr2html({ ocrResponse }: { ocrResponse: OCRResponse }) {
  const result = await ocr2html(ocrResponse);
  return (
    <div class="markdown-body" dangerouslySetInnerHTML={{ __html: result }} />
  );
}

export async function ocr2html(ocrResponse: OCRResponse): Promise<string> {
  const markdown = ocrResponse.pages.map((p) => p.markdown).join("\n\n");
  const images = ocrResponse.pages.map((p) => p.images).flat(2);
  const imageMap = arrayToRecord(images);

  const renderer = new marked.Renderer();

  renderer.image = function ({ href, title, text }) {
    if (href === null) {
      return text;
    }
    const imageInfo = imageMap[href];
    if (imageInfo) {
      const base64 = imageInfo.imageBase64;
      return `<img src="${base64}" alt="${text}" title="${title || ""}" />`;
    }
    return `<img src="${href}" alt="${text}" title="${title || ""}" />`;
  };

  const originalTable = renderer.table;
  renderer.table = function (token) {
    const tableHtml = originalTable.call(this, token);
    return `<figure>${tableHtml}</figure>`;
  };

  return marked.parse(markdown, { renderer });
}

function arrayToRecord<T extends { id: string }>(arr: T[]): Record<string, T> {
  const record: Record<string, T> = {};
  for (const item of arr) {
    record[item.id] = item;
  }
  return record;
}
