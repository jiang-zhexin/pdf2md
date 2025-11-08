/**
 * Modify from
 * https://github.com/honojs/hono/blob/main/src/middleware/cache/index.ts
 */
import type { Context, Middleware } from "fresh";
import { StatusCode } from "@/utils/http-status.ts";

const defaultCacheableStatusCodes: ReadonlyArray<StatusCode> = [200];

export function cache<T>(options: {
  cacheName: string | ((c: Context<T>) => Promise<string> | string);
  cacheControl?: string;
  vary?: string | string[];
  keyGenerator?: (c: Context<T>) => Promise<string> | string;
  cacheableStatusCodes?: StatusCode[];
}): Middleware<T> {
  if (!globalThis.caches) {
    console.log(
      "Cache Middleware is not enabled because caches is not defined.",
    );
    return async (c) => await c.next();
  }

  const cacheControlDirectives = options.cacheControl
    ?.split(",")
    .map((directive) => directive.toLowerCase());
  const varyDirectives = Array.isArray(options.vary)
    ? options.vary
    : options.vary?.split(",").map((directive) => directive.trim());
  // RFC 7231 Section 7.1.4 specifies that "*" is not allowed in Vary header.
  // See: https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.4
  if (options.vary?.includes("*")) {
    throw new Error(
      'Middleware vary configuration cannot include "*", as it disallows effective caching.',
    );
  }

  const cacheableStatusCodes = new Set<number>(
    options.cacheableStatusCodes ?? defaultCacheableStatusCodes,
  );

  const addHeader = (res: Response) => {
    if (cacheControlDirectives) {
      const existingDirectives = res.headers
        .get("Cache-Control")
        ?.split(",")
        .map((d) => d.trim().split("=", 1)[0]) ?? [];
      for (const directive of cacheControlDirectives) {
        let [name, value] = directive.trim().split("=", 2);
        name = name.toLowerCase();
        if (!existingDirectives.includes(name)) {
          res.headers.append(
            "Cache-Control",
            `${name}${value ? `=${value}` : ""}`,
          );
        }
      }
    }

    if (varyDirectives) {
      const existingDirectives = res.headers
        .get("Vary")
        ?.split(",")
        .map((d) => d.trim()) ?? [];

      const vary = Array.from(
        new Set(
          [...existingDirectives, ...varyDirectives].map((directive) =>
            directive.toLowerCase()
          ),
        ),
      ).sort();

      if (vary.includes("*")) {
        res.headers.set("Vary", "*");
      } else {
        res.headers.set("Vary", vary.join(", "));
      }
    }
  };

  return async function cache(c) {
    let key = c.req.url;
    if (options.keyGenerator) {
      key = await options.keyGenerator(c);
    }

    const cacheName = typeof options.cacheName === "function"
      ? await options.cacheName(c)
      : options.cacheName;
    const cache = await caches.open(cacheName);
    const response = await cache.match(key);
    if (response) {
      console.log(`match the cache: ${key}`);
      return new Response(response.body, response);
    }
    console.log(`not match the cache: ${key}`);

    const res = await c.next();
    if (!cacheableStatusCodes.has(res.status)) {
      return res;
    }
    addHeader(res);
    await cache.put(key, res.clone());
    return res;
  };
}
