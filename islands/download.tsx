import { ComponentChildren } from "preact";
import type { Signal } from "@preact/signals";
import type { OCRResponse } from "@mistralai/mistralai/models/components";

import { createTar } from "@/utils/createTar.ts";

export function DownloadMD(props: {
  name: string;
  resp: Signal<OCRResponse | null>;
  children?: ComponentChildren;
}) {
  return (
    <a
      href="#"
      onClick={async () => {
        if (!props.resp.value) return;
        const c = createTar(props.resp.value!, props.name);
        const url = URL.createObjectURL(await new Response(c).blob());
        const a = document.createElement("a");
        a.href = url;
        a.download = `${props.name}.tar.gz`;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      {props.children}
    </a>
  );
}
