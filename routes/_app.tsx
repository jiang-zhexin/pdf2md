import { define } from "@/utils.ts";
import { Footer } from "@/components/footer.tsx";
import icon from "@/assets/icon.svg";

export default define.page(({ Component }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>PDF2MD</title>
        <link rel="icon" href={icon} />
        <link rel="apple-touch-icon" href={icon} />
      </head>
      <body>
        <Component />
        <Footer />
      </body>
    </html>
  );
});
