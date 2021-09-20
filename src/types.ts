import { GluegunToolbox } from 'gluegun'
import { createCatalog } from './toolbox/catalog'
import { createMarkdown } from './toolbox/markdown'

export * from './toolbox/markdown-item'
export * from './toolbox/catalog'
export interface ToolboxWithCatalog extends GluegunToolbox {
  catalog: ReturnType<typeof createCatalog>
  markdown: ReturnType<typeof createMarkdown>
}
