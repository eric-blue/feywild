import * as fs from 'node:fs';
import * as path from 'node:path';

// @ts-expect-error
Bun.serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") return new Response("Feywild server is running");
    if (url.pathname === "/saves") {
      return new Response("Blog!")
    };
    return new Response("404: Not found");
  },
});

// Function to recursively get all JSON files in a folder
// function getAllJSONFilesInFolder(folderPath) {
//   const files = fs.readdirSync(folderPath);
//   let allJSONData = {};

//   files.forEach((file) => {
//     const filePath = path.join(folderPath, file);
//     const stats = fs.statSync(filePath);

//     if (stats.isDirectory()) {
//       // If it's a directory, recursively call the function
//       const nestedData = getAllJSONFilesInFolder(filePath);
//       allJSONData = { ...allJSONData, ...nestedData };
//     } else if (path.extname(filePath).toLowerCase() === '.json') {
//       // If it's a JSON file, read its content and add it to the object
//       try {
//         const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//         allJSONData[path.basename(filePath, '.json')] = jsonData;
//       } catch (error) {
//         console.error(`Error parsing JSON file: ${filePath}`);
//       }
//     }
//   });

//   return allJSONData;
// }