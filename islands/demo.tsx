import { useEffect } from "preact/hooks";
import type { Signal } from "@preact/signals";
import type { OCRResponse } from "@mistralai/mistralai/models/components";

import { Ocr2html } from "@/components/ocr2html.tsx";

export function Demo(props: {
  resp: Signal<OCRResponse | null>;
}) {
  useEffect(() => {
    fetch("/demo.json")
      .then((r) => r.json())
      .then((v) => props.resp.value = v);
  }, []);

  if (!props.resp.value) {
    return <p>fetch data...</p>;
  }

  return <Ocr2html ocrResponse={props.resp.value} />;
}
