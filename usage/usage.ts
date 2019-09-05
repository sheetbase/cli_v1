/**
 * Generates the How To section of the docs.
 * Ensures the code for sheetbase commands is well documented.
 * @todo Generate a list of commands for the beginning of the README.
 */
const fs = require('fs');
const fsExtra = require('fs-extra');
const parseComments = require('parse-comments');
const extract = require('extract-comments');
const file = fs.readFileSync('src/index.ts').toString();
const ucfirst = require('ucfirst');

// The README will be a concatenation of lines in this variable.
let readme = [
  '## Reference',
];

// Remove first line (#!/usr/bin/env node)
const fileLines = file.split('\n');
fileLines.splice(0, 1);
const fileWithoutFirstLine = fileLines.join('\n');

// Extract JSDoc comments out of our file.
const comments = extract(fileWithoutFirstLine);
for (const command of comments) {
  // To use the parseComments module, complete the stripped comment.
  const comment = `/*${command.raw}*/`;
  const sheetbaseCommand = parseComments(comment)[0];
  // Only print valid commands.
  if (sheetbaseCommand && sheetbaseCommand.description && sheetbaseCommand.name) {
    readme.push('');
    readme.push(`### \`${ucfirst(sheetbaseCommand.name)}\``);
    readme.push('');
    readme.push(sheetbaseCommand.description);
    // Parameters (@param)
    if (sheetbaseCommand.params && sheetbaseCommand.params.length) {
      readme.push('');
      // readme.push('#### Options\n');
      sheetbaseCommand.params.map(param => {
        const isOptional = param.type.indexOf('?') !== -1;
        // readme.push(JSON.stringify(param));
        const paramName = param.parent || param.description.split(' ')[0];
        if (isOptional) {
          readme.push([
            // `\`sheetbase ${sheetbaseCommand.name}`,
            `- \`${paramName}\`:`,
            param.description,
          ].join(' '));
        } else {
          // Required parameters descriptions aren't parsed by parse-comments. Parse them manually.
          readme.push([
            // `\`sheetbase ${sheetbaseCommand.name}`,
            `- \`${paramName}\`:`,
            param.description,
          ].join(' '));
        }
      });
    }
    // Examples (@example)
    if (sheetbaseCommand.example) {
      readme.push('');
      readme.push('#### Examples\n');
      const examples = sheetbaseCommand.example.split(',');
      examples.map(example => {
          const exampleSplit = example.split(' > ');
        readme.push(`- \`sheetbase ${exampleSplit[0]}\` ${exampleSplit[1]}`);
      });
    }
    // Extra Description (@desc)
    if (sheetbaseCommand.desc) {
      readme.push('');
      const lines = sheetbaseCommand.desc.split('-');
      lines.map((line, i) => {
        let value = '';
        if (i) value += '- ';
        readme.push(value + line.trim());
      });
    }
  }
}
fsExtra.outputFileSync('./usage.md', readme.join('\n'));
console.log('\nWrite ... ./usage.md');