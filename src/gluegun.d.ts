// export types
import 'gluegun'

import { createCatalog } from './extensions/config'

declare module 'gluegun' {
  interface GluegunToolbox {
    catalog: ReturnType<typeof createCatalog>
  }
}
