import { Hono } from "hono";
import { Mistral } from "@mistralai/mistralai";
import { HTTPClient } from "@mistralai/mistralai/lib/http";
import { Nav } from "../../components/nav";
import { Footer } from "../../components/footer";
import { Url } from "../../components/ocr/url";
import { Direct } from "../../components/ocr/direct";
import { Download } from "../../components/download";
import { ErrorBoundary } from "hono/jsx";

const pdf = new Hono<{ Bindings: Env }>().basePath("/pdf");

pdf.get("/", async (c) => {
  return c.render(
    <>
      <header>
        <Nav />
        <h1>Try it now!</h1>
      </header>
      <main>
        <h5>You can start with</h5>
        <article>
          <form action="/pdf/url">
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
          </form>
        </article>
        <h5>or</h5>
        <article>
          <form
            method="post"
            encType="multipart/form-data"
            action="/pdf/direct"
          >
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
      </main>
      <Footer />
    </>
  );
});

pdf.get("/url", async (c) => {
  const pdfUrl = c.req.query("pdfUrl");
  if (!pdfUrl) {
    return c.redirect("/pdf");
  }
  const {
    promise: idPromise,
    resolve,
    reject,
  } = Promise.withResolvers<string>();
  setTimeout(reject, 10000);
  const client = createClient(c.env, resolve);
  return c.render(
    <>
      <header>
        <Nav />
        <h1>PDF To Markdown</h1>
        <ErrorBoundary>
          <Download idPromise={idPromise} />
        </ErrorBoundary>
      </header>
      <main>
        <ErrorBoundary
          fallback={
            <p class="notice">
              It seems that it cannot be parsed. Is the English paper you gave?
            </p>
          }
        >
          <Url client={client} pdfUrl={pdfUrl} />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
});

pdf.post("/direct", async (c) => {
  const data = await c.req.formData();
  const pdfFile = data.get("pdfFile");

  if (!pdfFile || typeof pdfFile === "string") {
    return c.redirect("/pdf");
  }
  const {
    promise: idPromise,
    resolve,
    reject,
  } = Promise.withResolvers<string>();
  setTimeout(reject, 15000);
  const client = createClient(c.env, resolve);
  return c.render(
    <>
      <header>
        <Nav />
        <h1>PDF To Markdown</h1>
        <ErrorBoundary>
          <Download idPromise={idPromise} />
        </ErrorBoundary>
      </header>
      <main>
        <ErrorBoundary
          fallback={
            <p class="notice">
              It seems that it cannot be parsed. Is the English paper you gave?
            </p>
          }
        >
          <Direct client={client} pdfFile={pdfFile} />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
});

export default pdf;

function createClient(env: Env, resolve: (value: string) => void) {
  return new Mistral({
    apiKey: env.MISTRAL_API_KEY,
    httpClient: new HTTPClient({
      fetcher: async (input, init): Promise<Response> => {
        const req = new Request(input, init);
        if (req.url.startsWith("https://api.mistral.ai/v1/files")) {
          return fetch(req);
        }
        const endpoint = req.url.split("/").pop()!;
        const res = await env.AI.gateway("pdf2md").run({
          provider: "mistral",
          endpoint: endpoint,
          headers: Object.fromEntries(req.headers.entries()),
          query: await req.json(),
        });
        const aiGatewayLogId = res.headers.get("cf-aig-log-id");
        if (aiGatewayLogId) resolve(aiGatewayLogId);
        return res;
      },
    }),
  });
}
