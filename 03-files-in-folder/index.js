const { readdir, stat } = require('fs/promises');
const { join, parse, extname } = require('path');
const pathDirectory = join(__dirname, 'secret-folder');
const { EOL } = require('os');
const { stdout } = process;

readdir(pathDirectory, { withFileTypes: true })
  .then((files) => files
    .filter((file) => file.isFile())
    .forEach(async (file) => {
      const pathFile = join(pathDirectory, file.name);
      const { name } = parse(file.name);
      const extension = extname(file.name);
      const { size } = await stat(pathFile);
      const result = `${name} - ${extension.slice(1)} - ${(size / 1024).toFixed(2)}kb`;

      stdout.write(result);
      stdout.write(EOL);
    }));
