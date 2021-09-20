import { filesystem } from 'gluegun'
import { sync as globSync } from 'glob'
import { mountItem } from './markdown'
import defaultConfig from '../default-config'

export function createCatalog(catalogDirectory?: string) {
  const path = catalogDirectory || defaultConfig.path

  function findFilenames(filePattern: string, projectPatter = '**') {
    return globSync(filesystem.resolve(path, projectPatter, filePattern))
  }

  async function findAll(filePattern: string, projectPatter = '**') {
    const filenames = findFilenames(filePattern, projectPatter)

    const items = await Promise.all(filenames.map(f => mountItem(f)))

    return items
  }

  function findFilesConverted(pattern: string) {
    return globSync(
      filesystem.resolve(filesystem.cwd(), '.baka', '**', pattern)
    )
  }

  function findProjects(pattern: string) {
    return globSync(filesystem.resolve(path, pattern))
  }

  function findProjectsConverted(pattern: string) {
    return globSync(filesystem.resolve(filesystem.cwd(), '.baka', pattern))
  }

  return {
    path,
    findAll,
    findFilenames,
    findFilesConverted,
    findProjects,
    findProjectsConverted
  }
}
