import { Hono } from "hono";
import { Layout } from "./renderer";
import demo from "./demo";
import pdf from "./pdf";
import { Nav } from "../components/nav";
import { Footer } from "../components/footer";

const app = new Hono<{ Bindings: Env }>();

app.route("/", demo);
app.route("/", pdf);

app.use(Layout);

app.get("/", (c) => {
  return c.render(
    <>
      <header>
        <Nav />
        <h1>
          <img class="icon" src="/assets/icon.svg" />
          PDF To Markdown
        </h1>
      </header>
      <main>
        <p>
          A user-friendly front-end interface showcasing the powerful
          capabilities of <code>mistral-ocr-latest</code> and enables you to
          extract text and structured content from PDF documents by OCR (Optical
          Character Recognition).
        </p>
        <b>Key features:</b>
        <ul>
          <li>
            Extracts text content while maintaining document structure and
            hierarchy
          </li>
          <li>
            Preserves formatting like headers, paragraphs, lists and tables
          </li>
          <li>
            Returns results in markdown format for easy parsing and rendering
          </li>
          <li>
            Handles complex layouts including multi-column text and mixed
            content
          </li>
          <li>Processes documents at scale with high accuracy</li>
          <li>
            Supports multiple document formats including PDF and uploaded
            documents
          </li>
        </ul>
        <h3>How amazing it is?</h3>
        <p>
          You can visit the <a href="/demo">demo page</a> to quickly experience.
        </p>

        <h3>OK, I get it.</h3>
        <a class="button" href="/pdf">
          Let's try it now!
        </a>

        <h3>More information</h3>
        <p>
          You can refer to the{" "}
          <a href="https://docs.mistral.ai/capabilities/document/">
            mistral documentation
          </a>{" "}
          for more information.
        </p>
      </main>
      <Footer />
    </>
  );
});

export default app;
