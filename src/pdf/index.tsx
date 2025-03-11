import { Hono } from "hono";
import { Mistral } from "@mistralai/mistralai";
import { HTTPClient } from "@mistralai/mistralai/lib/http";
import { Nav } from "../../components/nav";
import { Footer } from "../../components/footer";
import { Url } from "../../components/ocr/url";
import { Direct } from "../../components/ocr/direct";
import { Download } from "../../components/download";

type Variables = {
  url?: string;
};

const pdf = new Hono<{ Bindings: Env; Variables: Variables }>().basePath(
  "/pdf"
);

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

pdf.get("/url", async (c, next) => {
  c.set("url", c.req.query("pdfUrl"));
  await next();
});

pdf.post("/url", async (c, next) => {
  const data = await c.req.formData();
  c.set("url", data.get("pdfUrl")?.toString());
  await next();
});

pdf.on(["GET", "POST"], "/url", async (c) => {
  const pdfUrl = c.get("url");
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
        <Download idPromise={idPromise} />
      </header>
      <main>
        <Url client={client} pdfUrl={pdfUrl} />
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
  setTimeout(reject, 60000);
  const client = createClient(c.env, resolve);
  return c.render(
    <>
      <header>
        <Nav />
        <h1>PDF To Markdown</h1>
        <Download idPromise={idPromise} />
      </header>
      <main>
        <Direct client={client} pdfFile={pdfFile} />
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
