import fs from "fs";
import path from "path";

const CACHE_TIME = 5 * 60 * 1000; // 5 min

function getCache(key: string) {
  const file = path.join(process.cwd(), "cache/yahoo", key + ".json");
  if (!fs.existsSync(file)) return null;

  const stat = fs.statSync(file);
  if (Date.now() - stat.mtimeMs > CACHE_TIME) return null;

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function setCache(key: string, data: any) {
  const file = path.join(process.cwd(), "cache/yahoo", key + ".json");
  fs.writeFileSync(file, JSON.stringify(data));
}
