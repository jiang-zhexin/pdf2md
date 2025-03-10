import { Mistral } from "@mistralai/mistralai";
import { Suspense } from "hono/jsx/streaming";
import { UploadFile } from "./upload";

export function Direct({
  client,
  pdfFile,
}: {
  client: Mistral;
  pdfFile: File;
}) {
  return (
    <Suspense fallback={<p>Uploading file to server...</p>}>
      <UploadFile client={client} pdfFile={pdfFile}></UploadFile>
    </Suspense>
  );
}
