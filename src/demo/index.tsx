import { Hono } from "hono";
import { Header, Layout } from "../renderer";
import { demoData } from "./demo";
import { Ocr2html } from "../../utils/ocr2html";
import { Suspense } from "hono/jsx/streaming";

const demo = new Hono().basePath("/demo");

demo.use(Layout);
demo.use(Header);

demo.get("/", async (c) => {
  return c.render(
    <Suspense fallback={<div>loading...</div>}>
      <Ocr2html ocrResponse={demoData} />
    </Suspense>,
    {
      title: (
        <>
          <h1>DEMO</h1>
          <p>
            You can find original paper{" "}
            <a target="_blank" href="https://arxiv.org/pdf/2201.04234">
              here
            </a>
            .
          </p>
        </>
      ),
    }
  );
});

export default demo;
