import { Hono } from "hono";
import { Layout } from "../renderer";
import { demoData } from "./demo";
import { Ocr2html } from "../../utils/ocr2html";
import { Suspense } from "hono/jsx/streaming";
import { Nav } from "../../components/nav";
import { Footer } from "../../components/footer";

const demo = new Hono().basePath("/demo");

demo.use(Layout);

demo.get("/", async (c) => {
  return c.render(
    <>
      <header>
        <Nav />
        <h1>DEMO</h1>
        <p>
          You can find original paper{" "}
          <a target="_blank" href="https://arxiv.org/pdf/2201.04234">
            here
          </a>
          .
        </p>
      </header>
      <main>
        <Suspense fallback={<div>loading...</div>}>
          <Ocr2html ocrResponse={demoData} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
});

export default demo;
