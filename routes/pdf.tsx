import { Mistral } from "@mistralai/mistralai";
import { signal } from "@preact/signals";
import type { OCRResponse } from "@mistralai/mistralai/models/components";

import { define } from "@/utils.ts";
import { PDF } from "@/islands/pdf.tsx";
import { Nav } from "@/components/nav.tsx";

export const ocrResponse = signal<OCRResponse | null>(null);

const client = new Mistral({
  apiKey: Deno.env.get("MISTRAL_API_KEY"),
});

export const handler = define.handlers({
  async POST(c) {
    const data = await c.req.formData();
    const pdfFile = data.get("pdfFile");
    if (!pdfFile || typeof pdfFile === "string") {
      return c.redirect("/pdf", 302);
    }

    const uploaded_pdf = await client.files.upload({
      file: {
        fileName: pdfFile.name,
        content: pdfFile,
      },
      purpose: "ocr",
    });
    const signedUrl = await client.files.getSignedUrl({
      fileId: uploaded_pdf.id,
    });

    const u = new URL(c.req.url);
    u.searchParams.set("pdfUrl", signedUrl.url);
    return c.redirect(u.toString(), 302);
  },
});

export default define.page(async (ctx) => {
  const u = new URL(ctx.req.url);
  const v = u.searchParams.get("pdfUrl");

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
            <form action="/pdf">
              <label htmlFor="pdfUrl">Type the pdf's URL:</label>
              <br />
              <textarea
                id="pdfUrl"
                name="pdfUrl"
                required
                placeholder="https://example.com/example.pdf"
                rows={1}
                style="resize: none"
              />
              <br />
              <button type="submit">submit</button>
            </form>
          </article>
          <h5>or</h5>
          <article>
            <form
              method="post"
              encType="multipart/form-data"
              action="/pdf"
            >
              <label htmlFor="pdfFile">Choose a pdf file</label>
              <input
                type="file"
                id="pdfFile"
                name="pdfFile"
                accept=".pdf"
                style="display: none"
                // deno-lint-ignore ban-ts-comment
                //@ts-ignore
                onChange="this.form.submit()"
              />
            </form>
          </article>
          <h5>Then wait for the beautiful article.</h5>
        </main>
      </>
    );
  }

  await client.ocr
    .process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: v,
      },
      includeImageBase64: true,
    })
    .then((v) => ocrResponse.value = v);

  return <PDF resp={ocrResponse} />;
});
