import { GluegunToolbox } from 'gluegun'
import { createCatalog } from './extensions/config'
interface ToolboxWithCatalog extends GluegunToolbox {
  catalog: ReturnType<typeof createCatalog>
}
