import { Mistral } from "@mistralai/mistralai";
import { Suspense } from "hono/jsx/streaming";
import { GetSignUrl } from "./sgin";

export async function UploadFile({
  client,
  pdfFile,
}: {
  client: Mistral;
  pdfFile: File;
}) {
  const uploaded_pdf = await client.files.upload({
    file: {
      fileName: pdfFile.name,
      content: pdfFile,
    },
    purpose: "ocr",
  });

  return (
    <Suspense fallback={<div>Signing URL...</div>}>
      <GetSignUrl client={client} uploadedPdf={uploaded_pdf}></GetSignUrl>
    </Suspense>
  );
}
