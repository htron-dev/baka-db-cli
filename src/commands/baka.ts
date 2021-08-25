import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'baka',
  run: async toolbox => {
    const { print } = toolbox

    print.info('Baka CLI')
  }
}

module.exports = command
