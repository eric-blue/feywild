import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import path from 'node:path';
  
function htmlify(text) {
  return (
    text
      // eslint-disable-next-line no-useless-escape
      .replace(/\'\'(.*?)\'\'/g, '<strong>$1</strong>')
      .replace(/\/\/(.*?)\/\//g, '<em>$1</em>')
      .trim()
  );
}

function safeHtmlId(text) {
  return text
    .replace(/^[^a-z]+|[^\w:.-]+/gi, '') // Remove unsafe characters
    .replace('.', '')
    .substring(0, 128); // Limit the length to 128 characters to avoid excessively long IDs
}

function transpileTweeToJs(tweeInput) {
  return tweeInput
    .split(':: ')
    .slice(1)
    .reduce((acc, passage) => {
      // eslint-disable-next-line prefer-const
      let [key, ...rest] = passage.split('\n');
      key = key.replace(/ \{.*\}/, '').trim();

      const optionIndex = rest.findIndex(line => line.startsWith('*'));
      /** collect all lines before the first option */
      const text = rest.slice(0, optionIndex === -1 ? undefined : optionIndex).join('\n');

      const options = rest.slice(optionIndex).reduce((acc, optionLine) => {
        const match = optionLine.match(/\[\[(.*?)(?:\|(.*?))?\]\]/);

        if (match) {
          acc.push({text: htmlify(match[1]), id: safeHtmlId(match[2] || match[1])});
        } else if (optionLine.startsWith('*')) {
          console.warn(`Warning: Failed to parse option: ${optionLine}`);
        }

        return acc;
      }, []);

      acc[safeHtmlId(key)] = {text: htmlify(text), options};

      return acc;
    }, {});
}

function compile(filename, optionalDir) {
  const tweeInput = readFileSync(path.join(import.meta.dir, filename), 'utf-8');
  const passages = transpileTweeToJs(tweeInput);
  const fname = filename.split('/').pop().replace(/\.[^/.]+$/, '');
  const nestedFolderPath = `src/models/game-objects/${optionalDir ?? fname}/dialogue/`;
  const outputFile = path.join(nestedFolderPath, `${fname}.json`);

  console.log(fname, outputFile)

  if (!existsSync(nestedFolderPath)) mkdirSync(nestedFolderPath, { recursive: true });

  writeFileSync(outputFile, JSON.stringify(passages, null, 2));
  console.log(`File has been written to ${outputFile}`);
}

const [fname, optionalDir] = process.argv.slice(2);

if (fname) compile(fname, optionalDir);
