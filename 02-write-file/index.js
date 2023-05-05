const { createWriteStream } = require('fs');
const { join } = require('path');
const { createInterface } = require('readline');
const { stdin, stdout, stderr } = process;
const path = join(__dirname, 'text.txt');
const writeStream = createWriteStream(path, { flag: 'a' });
const { EOL } = require('os'); // Символ окончания строки в данной системе
const input_out = createInterface({
  input: stdin,
  output: stdout,
  prompt: '>>> ',
});

process.on('exit', (code) => {
  stderr.write(code === 0 ? 'See you again in NodeJS!' : `Something went wrong. Error code: ${code}`);
});

input_out.on('line', (userInput) => {
  if (userInput === 'exit') {
    input_out.close();
    return;
  }
  writeStream.write(userInput);
  writeStream.write(EOL);
  input_out.prompt();
});
// SIGINT событие выхода ctrl + c
input_out.on('SIGINT', () => {
  stdout.write(EOL);
  input_out.close();
});

input_out.on('close', () => {
  stdout.write('');
  input_out.close();
});

input_out.prompt();
