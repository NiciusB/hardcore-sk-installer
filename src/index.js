#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
const steps = require('./steps')

// Enable deleting of all temporary files upon process exit
tmp.setGracefulCleanup()

// eslint-disable-next-line no-unused-expressions
require('yargs')
  .command('$0 install', 'Install Hardcore-SK in your Rimworld directory', (yargs) => {
    yargs
      .option('gameFolder', {
        type: 'string',
        default: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\RimWorld',
        description: 'Path to the folder where Rimworld is installed'
      })
      .option('zipUrl', {
        type: 'string',
        default: 'https://github.com/skyarkhangel/Hardcore-SK/archive/refs/heads/master.zip',
        description: 'URL from which to download the Hardcore-SK modpack. If a local path is provided, no file will be downloaded'
      })
  }, async (argv) => {
    const gameFolder = argv.gameFolder
    const zipUrl = argv.zipUrl
    const modsFolder = path.join(gameFolder, 'Mods')

    if (!fs.existsSync(gameFolder)) {
      throw new Error(`Invalid gamefolder: Directory "${gameFolder}" does not exist`)
    }
    if (!fs.existsSync(path.join(gameFolder, 'Mods'))) {
      throw new Error('Invalid gamefolder: "Mods" directory does not exist inside of it')
    }

    const ctx = { gameFolder, zipUrl, modsFolder }
    const zipFile = await steps.step1(ctx)
    const unzippedFolder = await steps.step2(ctx, zipFile)
    await steps.step3(ctx)
    await steps.step4(ctx, unzippedFolder)
    await steps.step5(ctx, unzippedFolder)

    console.log('All done!')
  })
  .argv
