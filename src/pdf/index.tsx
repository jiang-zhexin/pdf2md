import { Hono } from "hono";
import { Suspense } from "hono/jsx/streaming";
import { Header, Layout } from "../renderer";
import { createClient, ParseByUrl, UploadFile } from "./utils";

const pdf = new Hono<{ Bindings: Env }>().basePath("/pdf");

pdf.use(Layout);
pdf.use(Header);

pdf.get("/", async (c) => {
  return c.render(
    <>
      <h5>You can start with</h5>
      <article>
        <form method="post" encType="multipart/form-data" action="/pdf/url">
          <label htmlFor="pdfUrl">Type the pdf's URL:</label>
          <br />
          <textarea
            type="url"
            id="pdfUrl"
            name="pdfUrl"
            required
            placeholder="https://example.com/example.pdf"
            rows={1}
            style="resize: none;"
          />
          <br />
          <button type="submit">submit</button>
        </form>{" "}
      </article>
      <h5>or</h5>
      <article>
        <form method="post" encType="multipart/form-data" action="/pdf/direct">
          <label htmlFor="pdfFile">Choose a pdf file</label>
          <input
            type="file"
            id="pdfFile"
            name="pdfFile"
            accept=".pdf"
            style="display: none"
            onchange="this.form.submit()"
          />
        </form>
      </article>
      <h5>Then wait for the beautiful article.</h5>
    </>,
    {
      title: <h1>Try it now!</h1>,
    }
  );
});

pdf.post("/url", async (c) => {
  const data = await c.req.formData();
  const pdfUrl = data.get("pdfUrl")?.toString();
  if (!pdfUrl) {
    return c.redirect("/pdf");
  }
  const client = createClient(c.env);
  return c.render(
    <Suspense fallback={<p>OCRing...</p>}>
      <ParseByUrl client={client} pdfUrl={pdfUrl} />
    </Suspense>,
    {
      title: <h1>PDF To Markdown</h1>,
    }
  );
});

pdf.post("/direct", async (c) => {
  const data = await c.req.formData();
  const pdfFile = data.get("pdfFile");

  if (!pdfFile || typeof pdfFile === "string") {
    return c.redirect("/pdf");
  }
  const client = createClient(c.env);
  return c.render(
    <Suspense fallback={<p>Uploading file to server...</p>}>
      <UploadFile client={client} pdfFile={pdfFile}></UploadFile>
    </Suspense>,
    {
      title: <h1>PDF To Markdown</h1>,
    }
  );
});

export default pdf;
