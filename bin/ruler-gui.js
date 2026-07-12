#!/usr/bin/env node
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs')
const { join } = require('path')
const os = require('os')

function getStorePath() {
  const dir = process.env.APPDATA
    ? join(process.env.APPDATA, 'ruler-gui')
    : join(os.homedir(), '.config', 'ruler-gui')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'config.json')
}

function readStore() {
  try { return JSON.parse(readFileSync(getStorePath(), 'utf-8')) } catch { return {} }
}

function writeStore(s) {
  writeFileSync(getStorePath(), JSON.stringify(s, null, 2), 'utf-8')
}

function list() {
  const components = readStore().components || []
  console.log(JSON.stringify(components, null, 2))
}

function create(title, content, category = 'General') {
  const s = readStore()
  const components = s.components || []
  const id = 'c-' + Date.now()
  components.push({ id, title, content, category, globalHead: false, globalTail: false })
  s.components = components
  writeStore(s)
  console.log(JSON.stringify({ id, title, category }))
}

function remove(id) {
  const s = readStore()
  s.components = (s.components || []).filter(c => c.id !== id)
  writeStore(s)
  console.log('ok')
}

const argv = require('process').argv
const sub = argv[2]            // "components"
const cmd = argv[3]            // "list" | "create" | "delete"
const getFlag = (name) => {
  const i = argv.indexOf('--' + name)
  return i > -1 ? argv[i + 1] : undefined
}

if (sub !== 'components') {
  console.log(`Usage: ruler-gui components <command>

  list
  create --title <title> --content <md> --category <cat>
  delete --id <id>
`)
  process.exit(0)
}

switch (cmd) {
  case 'list': list(); break
  case 'create':
    create(
      getFlag('title') || 'Untitled',
      getFlag('content') || '## New Rule\n',
      getFlag('category') || 'General'
    ); break
  case 'delete':
    remove(getFlag('id') || ''); break
  default:
    console.log('Unknown command:', cmd)
    console.log('Available: list, create, delete')
}
