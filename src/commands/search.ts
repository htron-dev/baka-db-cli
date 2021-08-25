import * as fs from 'fs'
import * as glob from 'glob'
import * as path from 'path'
import { GluegunToolbox } from 'gluegun'

export default {
  name: 'search',
  alias: ['s'],
  run: async ({ parameters, print, catalog, config }: GluegunToolbox) => {
    const name = parameters.first

    if (!name) {
      print.error('name is required')
      return
    }

    const spinner = print.spin('start searching files')
    const startTime = Date.now()

    spinner.start()

    const files = catalog.findFiles(`*`)

    const results: string[] = []
    const searchBuffer = Buffer.from(name)

    files.forEach((file, index) => {
      const content = fs.readFileSync(file, 'utf-8')

      const percentage = Math.ceil((index * 100) / files.length)

      spinner.text = `searching files ${percentage}%`

      spinner.render()

      if (new RegExp(name, 'i').test(content)) {
        return results.push(file)
      }

      if (file.includes(name)) {
        return results.push(file)
      }
    })

    const resultsPretty = results.map(r => {
      let project = path.dirname(r.replace(`${config.catalog.path}/`, ''))

      if (project.length > 20) {
        project = `${project.slice(0, 20)}...`
      }

      return [project, r.replace(process.cwd(), '.')]
    })

    await new Promise(resolve => setTimeout(resolve, 5000))

    spinner.stop()

    if (resultsPretty.length) {
      print.table([['Project', 'Path'], ...resultsPretty], {
        format: 'lean'
      })
    }

    print.success(`Search completed: ${results.length} items founded`)
    print.success(`Time spend: ${(Date.now() - startTime) / 1000} seconds`)
  }
}
