import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const storageRoot = path.resolve(process.cwd(), ".runtime-documents");

function buildAbsolutePath(relativePath: string) {
  return path.resolve(storageRoot, relativePath);
}

export async function saveDocumentFile(relativePath: string, fileBuffer: Buffer) {
  const absolutePath = buildAbsolutePath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, fileBuffer);
  return absolutePath;
}

export async function readDocumentFile(relativePath: string) {
  return readFile(buildAbsolutePath(relativePath));
}

export async function deleteDocumentFile(relativePath: string) {
  await rm(buildAbsolutePath(relativePath), { force: true });
}
