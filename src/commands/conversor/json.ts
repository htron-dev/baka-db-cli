import { GluegunCommand } from 'gluegun'
import { ToolboxWithCatalog } from '../../types'

const command: GluegunCommand<ToolboxWithCatalog> = {
  name: 'json',
  run: async ({ print, parameters, prompt, catalog, filesystem }) => {
    let pattern = parameters.first

    if (!pattern) {
      const result = await prompt.ask({
        type: 'input',
        name: 'pattern',
        message: 'Project name or pattern:'
      })

      pattern = result.pattern
    }

    if (!pattern) {
      return
    }

    print.info(`search files...`)

    const items = await catalog.findAll('*', pattern)

    if (!parameters.options.y) {
      const confirm = await prompt.confirm(
        `${items.length} items found, wanna  proceed?`
      )

      if (!confirm) {
        return
      }
    }

    const destinyFolder = filesystem.resolve(filesystem.cwd(), '.baka')

    const startTime = Date.now()

    print.info('removing .baka folder')

    await filesystem.removeAsync(destinyFolder)

    items.forEach((item, index) => {
      const filename = filesystem.resolve(
        destinyFolder,
        item.folderName,
        item.itemName.replace('.md', '.json')
      )

      filesystem.write(filename, item.toObject(), {
        jsonIndent: 4
      })

      const percentage = Math.ceil((index * 100) / items.length)

      print.info(`converted ${index + 1}/${items.length} | ${percentage}%`)
    })

    print.table(
      [
        ['items converted', 'Time spend'],
        [`${items.length}`, `${(Date.now() - startTime) / 1000}`]
      ],
      {
        format: 'lean'
      }
    )

    print.highlight('Items converted')
    print.highlight(`Time spend: ${(Date.now() - startTime) / 1000}`)
  }
}

module.exports = command
