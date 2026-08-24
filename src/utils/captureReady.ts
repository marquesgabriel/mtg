// Waits until `node` is safe to rasterize with dom-to-image. A capture
// triggered right after a DOM swap (e.g. ensureCropped() replacing the
// interactive Cropper with a static <img>, or a freshly mounted TokenCard
// in renderCardImage.tsx) can race the browser: the swapped-in <img> may
// not have decoded yet, and/or the browser may not have painted the new
// layout yet, since neither is guaranteed by a synchronous DOM update
// (even via flushSync) or a couple of requestAnimationFrame callbacks
// alone. dom-to-image then rasterizes a stale/incomplete frame - the
// concrete symptom seen was card borders and art missing on two sides,
// as if the capture happened mid-paint.
export async function waitForCaptureReady(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => (img.decode ? img.decode().catch(() => undefined) : Promise.resolve())),
  );
  await document.fonts.ready;
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}
