import { GluegunToolbox } from 'gluegun'
import { createMarkdown } from '../toolbox/markdown'

export default (toolbox: GluegunToolbox) => {
  toolbox.markdown = createMarkdown()
}
