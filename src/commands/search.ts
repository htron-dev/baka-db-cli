// import * as fs from 'fs'
import * as path from 'path'
import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'search',
  description: 'Search a item in catalog',
  run: async ({ parameters, print, catalog, config, filesystem }) => {
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

    files.map((file, index) => {
      const content = filesystem.read(file, 'utf8')

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

    spinner.stop()

    if (resultsPretty.length) {
      print.table([['Project', 'Path'], ...resultsPretty], {
        format: 'lean'
      })
    }

    spinner.succeed(`Search completed`)
    print.info(`Items found: ${results.length}`)
    print.info(`Time spend: ${(Date.now() - startTime) / 1000} seconds`)
  }
}
export default command
