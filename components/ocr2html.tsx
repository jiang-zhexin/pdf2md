import { keyBy } from "@es-toolkit/es-toolkit";
import type { OCRResponse } from "@mistralai/mistralai/models/components";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import markedFootnote from "marked-footnote";

marked.use(markedFootnote());

marked.use(
  markedKatex({
    throwOnError: false,
    nonStandard: true,
    output: "mathml",
  }),
);

marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
});

export function Ocr2html({ ocrResponse }: { ocrResponse: OCRResponse }) {
  const markdown = ocrResponse.pages.map((p) => p.markdown).join("\n\n");
  const images = ocrResponse.pages.map((p) => p.images).flat(2);
  const imageMap = keyBy(images, (i) => i.id);

  const renderer = new marked.Renderer();

  renderer.image = function ({ href, title, text }) {
    const imageInfo = imageMap[href];
    if (!imageInfo) {
      return `<img src="${href}" alt="${text}" title="${title || ""}" />`;
    }
    const base64 = imageInfo.imageBase64;
    return `<img src="${base64}" alt="${text}" title="${title || ""}" />`;
  };

  const originalTable = renderer.table;
  renderer.table = function (token) {
    const tableHtml = originalTable.call(this, token);
    return `<figure>${tableHtml}</figure>`;
  };

  const result = marked.parse(markdown, { renderer, async: false });

  // deno-lint-ignore react-no-danger
  return <div dangerouslySetInnerHTML={{ __html: result }}></div>;
}
