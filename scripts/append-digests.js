module.exports = {
  prepare: async (pluginConfig, context) => {
    const fs = require('fs')
    const path = require('path')
    const logger = context.logger || console

    const backend = process.env.BACKEND_DIGEST || ''
    const frontend = process.env.FRONTEND_DIGEST || ''

    if (!backend && !frontend) {
      logger.log('No image digests found in environment; skipping append-digests')
      return
    }

    let section = '\n\n### Published images\n'
    if (backend) section += `- Backend: ${backend}\n`
    if (frontend) section += `- Frontend: ${frontend}\n`

    // Append to CHANGELOG.md so it gets committed by @semantic-release/git
    const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md')
    try {
      if (fs.existsSync(changelogPath)) {
        fs.appendFileSync(changelogPath, section, 'utf8')
        logger.log('Appended digests to CHANGELOG.md')
      } else {
        fs.writeFileSync(changelogPath, `# Changelog\n${section}`, 'utf8')
        logger.log('Created CHANGELOG.md with image digests')
      }
    } catch (err) {
      logger.error('Failed to write CHANGELOG.md', err)
      throw err
    }

    // Also augment the nextRelease.notes so it appears in the commit message
    try {
      const notes = context.nextRelease && context.nextRelease.notes ? context.nextRelease.notes : ''
      context.nextRelease = Object.assign({}, context.nextRelease, {
        notes: notes + '\n' + section
      })
      logger.log('Appended digests to nextRelease.notes')
    } catch (err) {
      logger.error('Failed to append to nextRelease.notes', err)
      // non-fatal — changelog already updated
    }
  }
}
