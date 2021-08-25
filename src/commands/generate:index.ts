import * as lodash from 'lodash'
import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'generate:index',
  description: 'Create catalog summary',
  run: async ({ parameters, print, catalog, filesystem }) => {
    const spinner = print.spin('Start creating index')

    const summaryPath = filesystem.resolve(filesystem.cwd(), 'summary')

    await filesystem.removeAsync(summaryPath)

    spinner.start()

    const files = catalog.findProjects(`*`)

    const letters = lodash(files)
      .map(p => p.split(filesystem.separator).pop())
      .groupBy(f => {
        const letter = f.charAt(0)
        if (/[a-z]/i.test(letter)) {
          return letter
        }
        return '0'
      })
      .value()

    const summary = ['# Summary']

    summary.push(
      Object.keys(letters)
        .map(letter => `| [${letter.toUpperCase()}](./${letter}.md) `)
        .join('') + '|'
    )

    summary.push(
      Object.keys(letters)
        .map(() => '| ----- ')
        .join('') + '|'
    )

    summary.push('')

    await Promise.all(
      Object.entries(letters).map(async ([letter, projects]) => {
        const content = []

        content.push(`## ${letter.toUpperCase()} `)

        lodash(projects).forEach(project => {
          content.push(`-   [${project}](./../catalog/${project})`)
        })

        await filesystem.writeAsync(
          filesystem.resolve(summaryPath, `${letter}.md`),
          summary.concat(content).join('\n')
        )

        spinner.info(`./summary/${letter}.md created`)

        spinner.render()
      })
    )

    spinner.stop()
    spinner.succeed('Catalog summary created')
  }
}

export default command
