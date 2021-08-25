import { GluegunToolbox, filesystem } from 'gluegun'
import * as path from 'path'
import * as glob from 'glob'

export function createCatalog(catalogPath: string) {
  function findFiles(pattern: string) {
    return glob.sync(filesystem.resolve(catalogPath, '**', pattern))
  }

  function findFilesConverted(pattern: string) {
    return glob.sync(
      filesystem.resolve(filesystem.cwd(), '.baka', '**', pattern)
    )
  }

  function findProjects(pattern: string) {
    return glob.sync(filesystem.resolve(catalogPath, pattern))
  }

  function findProjectsConverted(pattern: string) {
    return glob.sync(filesystem.resolve(filesystem.cwd(), '.baka', pattern))
  }

  return {
    findFiles,
    findFilesConverted,
    findProjects,
    findProjectsConverted
  }
}

export default (toolbox: GluegunToolbox) => {
  toolbox.config = {
    catalog: {
      path: path.join(process.cwd(), 'catalog')
    },
    ...toolbox.config,
    ...toolbox.config.loadConfig('baka', process.cwd())
  }

  const { catalog } = toolbox.config

  toolbox.catalog = createCatalog(catalog.path)
}
