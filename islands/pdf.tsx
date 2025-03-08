import type { Signal } from "@preact/signals";
import type { OCRResponse } from "@mistralai/mistralai/models/components";

import { Nav } from "@/components/nav.tsx";
import { Ocr2html } from "@/components/ocr2html.tsx";
import { DownloadMD } from "./download.tsx";

export function PDF(props: {
  resp: Signal<OCRResponse | null>;
}) {
  if (!props.resp.value) {
    return <OCRing />;
  }

  return (
    <>
      <header>
        <Nav />
        <h1>PDF To Markdown</h1>
        <p>
          <DownloadMD resp={props.resp} name="pdf2md">
            You can download raw markdown here.
          </DownloadMD>
        </p>
      </header>
      <main>
        <Ocr2html ocrResponse={props.resp.value} />
      </main>
    </>
  );
}

function OCRing() {
  return (
    <>
      <header>
        <Nav />
        <h1>PDF To Markdown</h1>
      </header>
      <main>
        <p class="notice">
          It seems that it cannot be parsed. Is the English paper you gave?
        </p>
      </main>
    </>
  );
}
