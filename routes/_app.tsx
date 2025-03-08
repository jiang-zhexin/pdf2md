import { define } from "@/utils.ts";
import { Footer } from "@/components/footer.tsx";

export default define.page(({ Component }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>PDF2MD</title>
        <link
          rel="stylesheet"
          href="https://cdn.simplecss.org/simple.min.css"
        />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="icon" href="/assets/icon.svg" />
        <link rel="apple-touch-icon" href="/assets/icon.svg" />
      </head>
      <body>
        <Component />
        <Footer />
      </body>
    </html>
  );
});
