/**
 * The API refers to images by file name ("work-desk-reset.svg"). Vite needs
 * real imports to fingerprint them, so we glob the folder once and look up
 * by name. Add new images to src/assets/img and reference them by file name.
 */
const files = import.meta.glob("../assets/img/*.{svg,png,jpg,jpeg,webp,avif}", {
  eager: true,
  query: "?url",
  import: "default",
});

const byName = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split("/").pop(), url])
);

export function imageUrl(name) {
  return byName[name] ?? null;
}
