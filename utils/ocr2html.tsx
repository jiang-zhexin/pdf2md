import { OCRResponse } from "@mistralai/mistralai/models/components";
import rehypeMathjax from "rehype-mathjax";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

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
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(() => {
      return (tree) => {
        visit(tree, "image", (node: { url: string }) => {
          if (node.url && imageMap[node.url]) {
            node.url = imageMap[node.url].imageBase64!;
          }
        });
      };
    })
    .use(remarkRehype)
    .use(rehypeMathjax)
    .use(() => {
      return (tree) => {
        visit(tree, "element", (node: any, index, parent) => {
          if (node.tagName === "table" && parent && typeof index === "number") {
            const figure = {
              type: "element",
              tagName: "figure",
              properties: {},
              children: [node],
            };
            parent.children[index] = figure;
          }
        });
      };
    })
    .use(rehypeStringify)
    .process(markdown);
  return String(result);
}

function arrayToRecord<T extends { id: string }>(arr: T[]): Record<string, T> {
  const record: Record<string, T> = {};
  for (const item of arr) {
    record[item.id] = item;
  }
  return record;
}
