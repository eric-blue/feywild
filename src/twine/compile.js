import {readFileSync, writeFileSync} from 'fs';
import path from 'node:path';

const [filename] = process.argv.slice(2);

if (!filename) {
  throw new Error('path/to/filename is required as an argument');
}

const tweeInput = readFileSync(path.join(import.meta.dir, filename), 'utf-8');

const passages = tweeInput
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

const outputFilename = path.join(
  import.meta.dir,
  '/dialogue/',
  `${filename
    .split('/')
    .pop()
    .replace(/\.[^/.]+$/, '')}.json`
);
writeFileSync(outputFilename, JSON.stringify(passages, null, 2));

console.log(`File has been written to ${outputFilename}`);
