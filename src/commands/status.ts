import { GluegunCommand } from 'gluegun'
import { ToolboxWithCatalog } from '../types'

const command: GluegunCommand<ToolboxWithCatalog> = {
  name: 'status',
  run: async ({ print, catalog, parameters, filesystem }) => {
    const spinner = print.spin('check status...')

    spinner.start()

    const projectPattern = parameters.options['project-pattern'] || '*'
    const filesPattern = parameters.options['file-pattern']

    const projects = catalog.findProjects(projectPattern)
    const projectsConverted = catalog.findProjectsConverted(projectPattern)

    const files = []
    const filesConverted = []

    projects.forEach(p => {
      const projectFiles = filesystem
        .list(p)
        .filter(p => !filesPattern || new RegExp(filesPattern, 'i').test(p))

      files.push(...projectFiles)
    })

    projectsConverted.forEach(p => {
      const projectFiles = filesystem
        .list(p)
        .filter(p => !filesPattern || new RegExp(filesPattern, 'i').test(p))

      filesConverted.push(...projectFiles)
    })

    spinner.stop()

    print.table(
      [
        ['', 'Total', 'Converted'],
        [
          'Files',
          files.length.toLocaleString(),
          filesConverted.length.toLocaleString()
        ],
        [
          'Projects',
          projects.length.toLocaleString(),
          projectsConverted.length.toLocaleString()
        ]
      ],
      {
        format: 'lean'
      }
    )
  }
}

export default command
