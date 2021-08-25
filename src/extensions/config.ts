import { GluegunToolbox } from 'gluegun'
import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob'

export function createCatalog(catalogPath: string) {
  function findFiles(pattern: string) {
    return glob.sync(`${catalogPath}/${pattern}*/*.md`)
  }

  return {
    findFiles
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
