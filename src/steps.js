const fs = require('fs')
const path = require('path')
const AdmZip = require('adm-zip')
const fetchAndSave = require('./fetchAndSave')
const tmp = require('tmp')
const fse = require('fs-extra')
const detectOS = require('./detectOS')

module.exports = {
  step1,
  step2,
  step3,
  step4,
  step5
}

/**
 *  Step 1: Download project ZIP
 */
async function step1 ({ zipUrl }) {
  const isLocalFile = fs.existsSync(zipUrl)
  let zipFile
  if (!isLocalFile) {
    console.log(`Downloading Hardcore-SK from ${zipUrl}...\nThis may take a while`)
    zipFile = tmp.fileSync().name
    await fetchAndSave(zipUrl, zipFile)
  } else {
    zipFile = zipUrl
  }

  return zipFile
}

/**
 * Step 2: Unzip
 */
async function step2 (_, zipFile) {
  console.log('Unzipping Hardcore-SK...')
  const tempUnzippedFolder = tmp.dirSync().name
  const zip = new AdmZip(zipFile)
  zip.extractAllTo(tempUnzippedFolder)
  const unzippedFolder = tmp.dirSync().name
  const rootEntryName = zip.getEntries()[0].entryName
  const rootEntryFolder = path.join(tempUnzippedFolder, rootEntryName)
  fse.moveSync(rootEntryFolder, unzippedFolder, { overwrite: true })

  return unzippedFolder
}

/**
 * Step 3: Delete old mods
 */
async function step3 ({ modsFolder }) {
  const modsToDelete = fs.readdirSync(modsFolder)
    .filter(mod => {
      // Deleteing of Core is now obsolete with rimworld version 1.1 and greater
      return mod !== 'Core'
    })
  console.log(`Deleting ${modsToDelete.length} mods...`)
  for (const mod of modsToDelete) {
    fs.rmdirSync(path.join(modsFolder, mod), { recursive: true })
  }
}

/**
 * Step 4: Copy new mods
 */
async function step4 ({ modsFolder }, unzippedFolder) {
  const newModsFolder = path.join(unzippedFolder, 'Mods')
  const newModsToCopy = fs.readdirSync(newModsFolder)
  console.log(`Copying new ${newModsToCopy.length} mods...`)
  fse.copySync(newModsFolder, modsFolder, { overwrite: true })
}

/**
 * Step 5: Copy ModsConfig.xml
 */
async function step5 (_, unzippedFolder) {
  const rimworldConfigFolder = getRimworldConfigFolder()
  const oldModsConfigFile = path.join(rimworldConfigFolder, 'ModsConfig.xml')

  console.log('Deleting old Rimworld config...')
  fse.emptyDirSync(rimworldConfigFolder)

  console.log(`Copying ModsConfig.xml to "${oldModsConfigFile}"...`)
  const newModsConfigFile = path.join(unzippedFolder, 'ModsConfig.xml')
  fse.copySync(newModsConfigFile, oldModsConfigFile, { overwrite: true })
}

function getRimworldConfigFolder () {
  const username = require('os').userInfo().username
  switch (detectOS()) {
    case 'windows': {
      return `C:\\Users\\${username}\\AppData\\LocalLow\\Ludeon Studios\\RimWorld by Ludeon Studios\\Config`
    }
    case 'linux': {
      return `/home/${username}/.config/unity3d/Ludeon Studios/RimWorld/Config`
    }
    case 'macos': {
      return `/Users/${username}/Library/Application Support/RimWorld/Config`
    }
    default:
      throw new Error(`Unknown OS: ${detectOS()}`)
  }
}
