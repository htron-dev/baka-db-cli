import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'conversor',
  run: async toolbox => {
    const { print } = toolbox

    print.info('Conversor')
  }
}

module.exports = command
