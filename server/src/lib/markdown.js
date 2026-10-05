/**
 * Loads a folder of Markdown files with YAML front matter (gray-matter).
 * Each file becomes { slug, ...frontMatter, body, readingTime, excerpt },
 * sorted newest first. Results are cached in production and re-read on every
 * request in development, so editing content needs no restart.
 */
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { config } from "../config.js";

const WORDS_PER_MINUTE = 220;
const cache = new Map();

/** Strip Markdown syntax well enough for word counts and excerpts. */
export function toPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^[#>\-*+\d.\s]+/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingTime(markdown) {
  const words = toPlainText(markdown).split(" ").filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return { minutes, words, text: `${minutes} min read` };
}

function excerptFrom(markdown, max = 180) {
  const firstParagraph = markdown
    .split(/\n\s*\n/)
    .find((block) => block.trim() && !block.trim().startsWith("#"));
  const text = toPlainText(firstParagraph ?? "");
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
}

async function readCollection(dir) {
  const folder = path.join(config.paths.data, dir);
  const files = (await fs.readdir(folder)).filter((f) => f.endsWith(".md"));

  const items = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(folder, file), "utf8");
      const { data, content } = matter(raw);
      const date = data.date ? new Date(data.date) : new Date(0);
      return {
        slug: path.basename(file, ".md"),
        ...data,
        date: date.toISOString(),
        excerpt: data.excerpt || excerptFrom(content),
        readingTime: readingTime(content).text,
        body: content.trim(),
      };
    })
  );

  return items.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function loadCollection(dir) {
  if (config.isProd && cache.has(dir)) return cache.get(dir);
  const items = await readCollection(dir);
  if (config.isProd) cache.set(dir, items);
  return items;
}

/** Find one item plus its newer/older neighbours (for prev/next links). */
export async function findWithNeighbours(dir, slug) {
  const items = await loadCollection(dir);
  const index = items.findIndex((item) => item.slug === slug);
  if (index === -1) return null;
  const pick = (item) => (item ? { slug: item.slug, title: item.title } : null);
  return {
    item: items[index],
    prev: pick(items[index - 1]), // newer
    next: pick(items[index + 1]), // older
  };
}
