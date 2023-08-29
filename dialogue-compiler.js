// eslint-disable-next-line node/no-unpublished-import
import fs from 'graceful-fs';

/**
 * This doesn't work quite yet
 */

// Read the Zenuml file
const zenumlContent = fs.readFileSync('public/dialogue/rebecca.zenuml', 'utf8');

// Define regex pattern to match sender, receiver, and message
const regexPattern = /^(.*?)\s*->\s*(.*?):\s*(.*?)$/;
// const leadingSpacesRegex = /^(\s*)/;

const lines = zenumlContent.split('\n').filter(line => {
  return (
    line.trim() !== '' && !line.startsWith('//') && !line.startsWith('@Actor')
  );
}); // Remove empty lines

const output = {};
let idCounter = 0; // Initialize a counter for unique IDs

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  // const nextLine = lines[i + 1].trim();

  const match = line.match(regexPattern);
  if (match) {
    const [, sender, receiver, message] = match;
    const interaction = {
      sender,
      receiver,
      message,
      options: [],
      nextId: null,
      // include a "break" method to pause the interaction and play some sort of scene gimmick
    };

    // capture options as pointers for branching nested logic
    // if the next line is `if`, `else`, `else if`: we know we're about to begin a branch
    // NOTE: leading spaces denotes a new block/branch. IE: `if` is top-level and `  if` is another level
    // for each nested block:
    // after the if, push that `interaction_ID` to interaction.options
    // after the else if, push that `interaction_ID` to interaction.options
    // after the else, push that `interaction_ID` to interaction.options

    // set nextId if not followed by an if statement
    // if inside an if/else if/else statement, the nextId should be the dialogue that comes after `end`

    output[`interaction_${idCounter}`] = interaction;
  }
  idCounter++; // each line gets a unique id. Only some are used
}

console.log(output);

// Save the JSON data to a file
// console.log('JSON data saved to rebecca.json');
// fs.writeFileSync('public/dialogue/rebecca.json', JSON.stringify(output, null, 2));
