function detectOS () {
  if (process.platform === 'win32') {
    return 'windows'
  }

  if (process.platform === 'linux') {
    return 'linux'
  }

  if (process.platform === 'darwin') {
    return 'macos'
  }

  return null
}

module.exports = detectOS
