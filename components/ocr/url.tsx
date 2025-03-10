import { Mistral } from "@mistralai/mistralai";
import { Suspense } from "hono/jsx/streaming";
import { Ocr } from "./ocr";

export function Url({ client, pdfUrl }: { client: Mistral; pdfUrl: string }) {
  return (
    <Suspense fallback={<p>OCRing...</p>}>
      <Ocr client={client} pdfUrl={pdfUrl} />
    </Suspense>
  );
}
