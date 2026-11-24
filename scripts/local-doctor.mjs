import { existsSync } from 'node:fs'

const minimumNode = [24, 22, 1]
const currentNode = process.versions.node.split('.').map(Number)

function meetsMinimum(current, minimum) {
  for (const [index, value] of minimum.entries()) {
    if (current[index] > value) return true
    if (current[index] < value) return false
  }
  return true
}

const requiredFiles = ['package.json', 'pnpm-lock.yaml', 'next.config.ts', 'src/payload.config.ts']
const missingFiles = requiredFiles.filter((file) => !existsSync(file))
const packageManager = process.env.npm_config_user_agent?.split(' ')[0] ?? 'unknown'
let hasError = false

console.log('ScholarLocal local environment doctor')
console.log(`Node.js: ${process.versions.node}`)
console.log(`Package manager: ${packageManager}`)

if (!meetsMinimum(currentNode, minimumNode)) {
  console.error('ERROR: Node.js 24.22.1 or newer is required by package.json.')
  hasError = true
}

if (missingFiles.length > 0) {
  console.error(`ERROR: Missing required files: ${missingFiles.join(', ')}`)
  hasError = true
}

if (!process.env.FIGMA_EID) {
  console.error(
    [
      'ERROR: FIGMA_EID is not available.',
      'This project uses @payloadcms/figma and buildFigmaConfig(), which depend on',
      'Figma-managed database, storage, and authentication configuration.',
      'Do not invent an environment ID or substitute a Figma file key.',
      'Figma currently does not document a supported local initialization flow for',
      'downloaded Payload-backed Make projects.',
      'Run the full app in Figma Make, or contact Figma Support for an officially',
      'supported local-backend export or environment provisioning workflow.',
    ].join('\n'),
  )
  hasError = true
} else {
  console.log('FIGMA_EID: present (value not displayed)')
  console.warn('NOTE: FIGMA_EID alone may not provide the remaining managed backend credentials.')
}

process.exitCode = hasError ? 1 : 0
