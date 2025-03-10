import { Mistral } from "@mistralai/mistralai";
import { Suspense } from "hono/jsx/streaming";
import { Ocr2html } from "../ocr2html";

export async function Ocr({
  client,
  pdfUrl,
}: {
  client: Mistral;
  pdfUrl: string;
}) {
  const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      type: "document_url",
      documentUrl: pdfUrl,
    },
    includeImageBase64: true,
  });
  return (
    <Suspense fallback={<p>Rendering to HTML...</p>}>
      <Ocr2html ocrResponse={ocrResponse} />
    </Suspense>
  );
}
