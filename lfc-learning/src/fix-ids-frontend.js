import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("src");

// Recursively walk through files
function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walk(filepath, filelist);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

// Replace id/_id
function fixFile(file) {
  let content = fs.readFileSync(file, "utf8");
  let newContent = content;

  // Safe replacements: dot access and object keys
  newContent = newContent.replace(/\._id/g, ".id");   // backend → frontend
  newContent = newContent.replace(/: _id/g, ": id");  // destructuring
  newContent = newContent.replace(/_id:/g, "id:");    // object keys

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, "utf8");
    console.log(`Fixed: ${file}`);
  }
}

function main() {
  const files = walk(SRC_DIR);
  files.forEach(fixFile);
  console.log("✅ Frontend ID fix complete.");
}

main();
