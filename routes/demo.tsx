import { signal } from "@preact/signals";
import type { OCRResponse } from "@mistralai/mistralai/models/components";

import { define } from "@/utils.ts";
import { Demo } from "@/islands/demo.tsx";
import { Nav } from "@/components/nav.tsx";
import { DownloadMD } from "@/islands/download.tsx";

export const ocrResponse = signal<OCRResponse | null>(null);

export default define.page(function Home() {
  return (
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
          <DownloadMD resp={ocrResponse} name="demo">here</DownloadMD>
          .
        </p>
      </header>
      <main>
        <Demo resp={ocrResponse}></Demo>
      </main>
    </>
  );
});
