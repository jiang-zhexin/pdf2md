import { Suspense } from "hono/jsx/streaming";

export async function Download({ idPromise }: { idPromise: Promise<string> }) {
  return (
    <Suspense fallback={<div>wait...</div>}>
      <p>
        <a href={`/md/${await idPromise}`} download={`${await idPromise}.tar`}>
          You can download raw markdown here.
        </a>
      </p>
      <cite>If the download fails, please wait 10 seconds and try again.</cite>
    </Suspense>
  );
}
