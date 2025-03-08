import { Mistral } from "@mistralai/mistralai";
import { HTTPClient } from "@mistralai/mistralai/lib/http";
import { UploadFileOut } from "@mistralai/mistralai/models/components";
import { Suspense } from "hono/jsx";
import { Ocr2html } from "../../utils/ocr2html";

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
    // @ts-ignore
    purpose: "ocr",
  });

  return (
    <Suspense fallback={<div>Signing URL...</div>}>
      <GetSignUrl client={client} uploadedPdf={uploaded_pdf}></GetSignUrl>
    </Suspense>
  );
}

async function GetSignUrl({
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
      <ParseByUrl client={client} pdfUrl={signedUrl.url}></ParseByUrl>
    </Suspense>
  );
}

export async function ParseByUrl({
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

export function createClient(env: Env) {
  return new Mistral({
    apiKey: env.MISTRAL_API_KEY,
    httpClient: new HTTPClient({
      fetcher: async (input, init): Promise<Response> => {
        const req = new Request(input, init);
        if (req.url.startsWith("https://api.mistral.ai/v1/files")) {
          return fetch(req);
        }
        const endpoint = req.url.split("/").pop()!;
        return env.AI.gateway("pdf2md").run({
          provider: "mistral",
          endpoint: endpoint,
          headers: Object.fromEntries(req.headers.entries()),
          query: await req.json(),
        });
      },
    }),
  });
}
