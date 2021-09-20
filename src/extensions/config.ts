import { GluegunToolbox, filesystem } from 'gluegun'
import { createCatalog } from '../toolbox/catalog'

export default (toolbox: GluegunToolbox) => {
  toolbox.config = {
    ...toolbox.config,
    ...toolbox.config.loadConfig('baka', process.cwd())
  }

  toolbox.catalog = createCatalog()
}
