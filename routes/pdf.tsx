import { Mistral } from "@mistralai/mistralai";
import { signal } from "@preact/signals";
import type { OCRResponse } from "@mistralai/mistralai/models/components";

import { define } from "@/utils.ts";
import { PDF } from "@/islands/pdf.tsx";
import { Nav } from "@/components/nav.tsx";
import { FormData, Query } from "@/islands/submit.tsx";

const client = new Mistral({ apiKey: Deno.env.get("MISTRAL_API_KEY") });

const ocrResponse = signal<OCRResponse | null>(null);
const getKey = "pdfUrl";
const postkey = "pdfFile";

export const handler = define.handlers({
  async POST(c) {
    const u = new URL(c.req.url);
    const data = await c.req.formData();
    const pdfFile = data.get(postkey);
    if (!pdfFile || typeof pdfFile === "string") {
      return c.redirect(u.toString(), 302);
    }

    const uploaded_pdf = await client.files.upload({
      file: { fileName: pdfFile.name, content: pdfFile },
      purpose: "ocr",
    });
    const signedUrl = await client.files.getSignedUrl({
      fileId: uploaded_pdf.id,
    });

    u.searchParams.set(getKey, signedUrl.url);
    return c.redirect(u.toString(), 302);
  },
});

export default define.page(async (ctx) => {
  const u = new URL(ctx.req.url);
  const v = u.searchParams.get(getKey);

  if (!v) {
    return (
      <>
        <header>
          <Nav />
          <h1>Try it now!</h1>
        </header>
        <main>
          <h5>You can start with</h5>
          <article>
            <Query pathname={u.pathname} name={getKey} />
          </article>
          <b>or</b>
          <br />
          <br />
          <article>
            <FormData pathname={u.pathname} name={postkey} />
          </article>
          <b>Then wait for the beautiful article.</b>
        </main>
      </>
    );
  }

  await client.ocr
    .process({
      model: "mistral-ocr-latest",
      document: { type: "document_url", documentUrl: v },
      includeImageBase64: true,
    })
    .then((v) => ocrResponse.value = v)
    .catch((e) => console.error(e));

  return <PDF resp={ocrResponse} />;
});
