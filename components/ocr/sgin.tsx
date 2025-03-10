import { Mistral } from "@mistralai/mistralai";
import { UploadFileOut } from "@mistralai/mistralai/models/components";
import { Suspense } from "hono/jsx/streaming";
import { Ocr } from "./ocr";

export async function GetSignUrl({
  client,
  uploadedPdf,
}: {
  client: Mistral;
  uploadedPdf: UploadFileOut;
}) {
  const signedUrl = await client.files.getSignedUrl({
    fileId: uploadedPdf.id,
  });
  return (
    <Suspense fallback={<p>OCRing...</p>}>
      <Ocr client={client} pdfUrl={signedUrl.url}></Ocr>
    </Suspense>
  );
}
