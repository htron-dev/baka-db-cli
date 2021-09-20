import { filesystem } from 'gluegun'
import { kebabCase } from 'lodash'

export interface Schema {
  type: string
  lineTest: (line: string) => boolean
  lineEndTest?: (line: string) => boolean
  format?: (line: string) => string
}

const properties = [
  'type',
  'episodes',
  'volumes',
  'chapters',
  'original_name',
  'start_date',
  'end_date',
  'opening_song',
  'ending_song',
  'rating'
]

const propertiesSchema = properties.reduce<Record<string, Schema>>(
  (all, p) => ({
    ...all,
    [p]: {
      type: 'string',
      lineTest: line => line.includes(`**${kebabCase(p)}**:`),
      format: line => line.replace(`-   **${kebabCase(p)}**:`, '').trim()
    }
  }),
  {}
)

const schema: Record<string, Schema> = {
  ...propertiesSchema,
  title: {
    type: 'string',
    lineTest: line => /^\# .*$/.test(line),
    format: line => line.replace(/#+ /g, '')
  },
  authors: {
    type: 'list',
    lineTest: line => line === '## Authors',
    lineEndTest: line => line.includes('##')
  },
  links: {
    type: 'list',
    lineTest: line => line === '## Links',
    lineEndTest: line => line.includes('##')
  },
  tags: {
    type: 'list',
    lineTest: line => line === '## Tags',
    lineEndTest: line => line.includes('##')
  },
  sinopse: {
    type: 'text',
    lineTest: line => line === '## Sinopse',
    lineEndTest: line => line.includes('##')
  }
}

const config = {
  path: filesystem.resolve(filesystem.cwd(), 'catalog'),
  files: [
    {
      patter: '.*',
      schema
    }
  ]
}

export default config
