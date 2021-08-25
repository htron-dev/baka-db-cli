import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'baka',
  description: 'Welcome command',
  run: async toolbox => {
    const { print } = toolbox

    print.info('Baka CLI')

    print.printCommands(toolbox)
  }
}

export default command
