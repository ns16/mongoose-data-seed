import _fs from 'fs';
import path from 'path';
import memFs from 'mem-fs';
import editor from 'mem-fs-editor';
import chalk from 'chalk';
import logSymbols from 'log-symbols';

import getOptions from './options';
import usageGuide from './usageGuide';
import config from '../../lib/config';


export default function () {
  const { es6, seedersFolder, helpWanted } = getOptions(process.argv);

  if (helpWanted) {
    console.log(usageGuide);
  } else {
    return init({ es6, seedersFolder });
  }
}

function init({ es6 = false, seedersFolder = 'seeders' }) {
  const store = memFs.create();
  const fs = editor.create(store);

  _writeUserGeneratorConfig();
  _writeUserConfig();
  _createSeedersFolder();

  function _writeUserGeneratorConfig() {
    const {
      projectRoot,
      userGeneratorConfigExists,
      userGeneratorConfigFilename,
      userGeneratorConfigFilepath
    } = config;

    const generatorConfig = { es6, seedersFolder };

    if (userGeneratorConfigExists !== true) {
      fs.writeJSON(userGeneratorConfigFilepath, generatorConfig);

      config.useEs6Generator = generatorConfig.es6;
      config.userSeedersFolderName = generatorConfig.seedersFolder;
      config.userSeedersFolderPath = path.join(projectRoot, generatorConfig.seedersFolder);

      fs.commit(() => {
        console.log(`${chalk.green('CREATED')} ${userGeneratorConfigFilename}`);
      });
    } else {
      console.log(`${chalk.yellow('CONFLICT')} ${userGeneratorConfigFilename} are already exists`);
    }
  }

  function _createSeedersFolder() {
    const { userSeedersFolderName, userSeedersFolderPath } = config;

    if (_fs.existsSync(userSeedersFolderPath)) {
      return console.log(`${chalk.yellow('CONFLICT')} ${userSeedersFolderName}/ are already exists`);
    }

    try {
      _fs.mkdirSync(userSeedersFolderPath);
      console.log(`${chalk.green('CREATED')} ${userSeedersFolderName}/`);
    } catch (error) {
      console.log(`${chalk.red('ERROR')} ${userSeedersFolderName}/ unable to create folder`);
      return console.log(error.stack);
    }
  }

  function _writeUserConfig() {
    const { userConfigExists, userConfigFilename, userConfigFilepath, useEs6Generator } = config;
    const templatePath = useEs6Generator ?
      path.join(__dirname, '../../../templates/md-seed-config.es6.js') :
      path.join(__dirname, '../../../templates/md-seed-config.js');

    if (userConfigExists !== true) {
      fs.copy(templatePath, userConfigFilepath);
      fs.commit(() => {
        console.log(`${chalk.green('CREATED')} ${userConfigFilename}`);
      });
    } else {
      console.log(`${chalk.yellow('CONFLICT')} ${userConfigFilename} are already exists`);
    }
  }
}