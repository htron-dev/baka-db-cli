import { GluegunToolbox } from 'gluegun'
import { createCatalog } from './extensions/config'
import { createMarkdown } from './extensions/markdown'
interface ToolboxWithCatalog extends GluegunToolbox {
  catalog: ReturnType<typeof createCatalog>
  markdown: ReturnType<typeof createMarkdown>
}
