import { GluegunCommand } from 'gluegun'
import { ToolboxWithCatalog } from '../../types'

const command: GluegunCommand<ToolboxWithCatalog> = {
  name: 'json',
  run: async ({
    print,
    parameters,
    prompt,
    config,
    catalog,
    filesystem,
    markdown
  }) => {
    let pattern = parameters.first

    if (!pattern) {
      const result = await prompt.ask({
        type: 'input',
        name: 'pattern',
        message: 'Project name or regex pattern:'
      })

      pattern = result.pattern
    }

    if (!pattern) {
      return
    }

    const projects = catalog.findProjects(pattern)

    if (!parameters.options.y) {
      const confirm = await prompt.confirm(
        `${projects.length} projects found, wanna  proceed?`
      )

      if (!confirm) {
        return
      }
    }

    const tempFolder = filesystem.resolve(filesystem.cwd(), '.baka')

    const spinner = print.spin('Start conversion...')
    const startTime = Date.now()

    spinner.start()

    spinner.info('removing .baka folder')

    await filesystem.removeAsync(tempFolder)

    projects.forEach((project, index) => {
      const files = filesystem.list(project)
      const projectName = project.split(filesystem.separator).pop()

      files.map(f => {
        const json = markdown.fileToObject(
          filesystem.resolve(config.catalog.path, project, f)
        )

        filesystem.write(
          filesystem.resolve(
            tempFolder,
            projectName,
            f.replace('.md', '.json')
          ),
          json,
          {
            jsonIndent: 4
          }
        )
      })

      const percentage = Math.ceil((index * 100) / projects.length)

      spinner.text = `Current progress: ${percentage}%`

      spinner.render()
    })

    spinner.stop()

    spinner.succeed('Projects converted')
    spinner.succeed(`Time spend: ${(Date.now() - startTime) / 1000}`)
  }
}

module.exports = command
