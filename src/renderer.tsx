import { jsxRenderer } from "hono/jsx-renderer";

export const Layout = jsxRenderer(
  ({ children }) => {
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
        <body>{children}</body>
      </html>
    );
  },
  { stream: true }
);
