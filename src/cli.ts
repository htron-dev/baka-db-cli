import { build, filesystem } from 'gluegun'

async function run(argv) {
  // create a CLI runtime
  const cli = build()
    .brand('baka')
    .src(__dirname)
    .plugin(filesystem.resolve(filesystem.cwd(), 'baka-extends'))
    .help() // provides default for help, h, --help, -h
    .version() // provides default for version, v, --version, -v
    .create()

  const toolbox = await cli.run(argv)

  return toolbox
}

module.exports = { run }
