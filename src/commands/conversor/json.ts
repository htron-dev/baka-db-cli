import { GluegunCommand, strings } from 'gluegun'
import { ToolboxWithCatalog } from '../../types'

export function markdownListToObject(content: string) {
  return content
    .split('\n')
    .map(l => l.split(':'))
    .map(([key, value]) => [
      strings.snakeCase(key).replace(/[^a-zA-Z_]/g, ''),
      strings.trim(value)
    ])
    .reduce(
      (result, [key, value]) => ({
        ...result,
        [key]: value
      }),
      {}
    )
}
export function markdownListToArray(content: string) {
  return content
    .split('\n')
    .map(i => i.replace(/[- ]+ /g, ''))
    .map(item => {
      const isLink = /\(.*?\)/.test(item) && /\[.*?\]/.test(item)

      if (isLink) {
        return {
          text: item.match(/\[(.*?)\]/)[1],
          link: item.match(/\((.*?)\)/)[1]
        }
      }

      return item
    })
}

export function convertMarkdownToObject(content: string) {
  const blocks = new Map<string, string[]>()
  const result: any = {}

  let currentBlock = undefined

  content
    .split('\n')
    .filter(c => c !== '')
    .forEach(line => {
      if (line.charAt(0) === '#') {
        currentBlock = line
        blocks.set(currentBlock, [])
        return
      }

      blocks.set(currentBlock, [...blocks.get(currentBlock), line])
    })

  blocks.forEach((lines, key) => {
    const name = strings.snakeCase(key).replace(/[^a-zA-Z_]/g, '')

    const isTitle = /^\# .*$/.test(key)

    if (isTitle) {
      result['title'] = key.replace(/#+ /g, '')
      Object.assign(result, markdownListToObject(lines.join('\n')))
      return
    }

    let value: any = lines.join('\n')

    const isList = lines.every(l => l.charAt(0) === '-')

    if (isList) {
      value = markdownListToArray(lines.join('\n'))
    }

    result[name] = value
  })

  return result
}

const command: GluegunCommand<ToolboxWithCatalog> = {
  name: 'json',
  run: async ({ print, parameters, prompt, config, catalog, filesystem }) => {
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
        const content = filesystem.read(
          filesystem.resolve(config.catalog.path, project, f)
        )

        const json = convertMarkdownToObject(content)

        filesystem.write(
          filesystem.resolve(
            tempFolder,
            projectName,
            f.replace('.md', '.json')
          ),
          json
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
