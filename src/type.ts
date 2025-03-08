import { HtmlEscapedString } from "hono/utils/html";

declare module "hono" {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props: {
        title: Promise<HtmlEscapedString> | HtmlEscapedString;
      }
    ): Response;
  }
}
