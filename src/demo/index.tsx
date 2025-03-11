import { Hono } from "hono";
import { stream } from "hono/streaming";
import { Suspense } from "hono/jsx/streaming";
import demoData from "./data.json";
import { Ocr2html } from "../../components/ocr2html";
import { Nav } from "../../components/nav";
import { Footer } from "../../components/footer";
import { createTar } from "../../utils/createTar";

const demo = new Hono().basePath("/demo");

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
          </a>{" "}
          and download raw markdown{" "}
          <a href="/demo/md" download="demo.tar">
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

demo.get("/md", async (c) => {
  const id = "demo";
  c.header("Content-Disposition", `attachment; filename="${id}.tar"`);

  const tar = createTar(demoData, id);
  return stream(c, async (stream) => {
    await stream.pipe(tar);
  });
});

export default demo;
