import { readdir } from "node:fs/promises";
import Path from "path";

const directoryPath = Path.join(process.cwd(), "Media", "temp");
try {
  const files = await readdir(directoryPath);
  for (const file of files) {
    const filePath = Path.join(directoryPath, file);
    await Bun.file(filePath).delete();
    console.log(`Deleted file: ${filePath}`);
  }
} catch (error) {
  console.error("Error reading directory or deleting files:", error);
}
