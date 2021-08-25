import { GluegunToolbox, strings } from 'gluegun'

export function markdownListToObject(content: string) {
  return content
    .split('\n')
    .map(l => l.split(':'))
    .map(([key, value]) => [
      strings.snakeCase(key).replace(/[^a-zA-Z_]/g, ''),
      strings.trim(value)
    ])
    .reduce(
      (result, [key, value]) => ({
        ...result,
        [key]: value
      }),
      {}
    )
}

export function markdownListToArray(content: string) {
  return content
    .split('\n')
    .filter(l => l !== '')
    .map(i => i.replace(/[- ]+ /g, ''))
    .map(item => {
      const isLink = /\(.*?\)/.test(item) && /\[.*?\]/.test(item)

      if (isLink) {
        return {
          text: item.match(/\[(.*?)\]/)[1],
          link: item.match(/\((.*?)\)/)[1]
        }
      }

      return item
    })
}

export function createMarkdown({ filesystem }: GluegunToolbox) {
  const catalog = {
    path: filesystem.resolve(filesystem.cwd(), 'catalog'),
    files: [
      {
        patter: '.*',
        blocks: [
          {
            name: 'title',
            type: 'object',
            merge: true,
            start: /^\# .*$/,
            end: '##'
          },
          {
            name: 'alternative_names',
            type: 'list',
            start: '## Alternative names',
            end: '##'
          },
          {
            name: 'authors',
            type: 'list',
            start: '## Authors',
            end: '##'
          },
          {
            name: 'tags',
            type: 'list',
            start: '## Tags',
            end: '##'
          },
          {
            name: 'sinopse',
            type: 'text',
            start: '## Sinopse',
            end: '##'
          },
          {
            name: 'links',
            type: 'list',
            start: '## Links'
          }
        ]
      }
    ]
  }

  function fileToObject(filename: string) {
    const config = catalog.files.find(c => filename.match(c.patter))

    if (!config) return

    const content = filesystem.read(filename)

    const blocks = new Map<string, string[]>()
    let currentBlock = undefined

    // config.blocks.forEach(b => blocks.set(b.name, []))

    content.split('\n').forEach(line => {
      const startBlock = config.blocks.find(b => line.match(b.start))

      if (currentBlock?.end && line.match(currentBlock?.end)) {
        currentBlock = undefined
      }

      if (startBlock) {
        currentBlock = startBlock
      }

      if (currentBlock) {
        blocks.set(currentBlock.name, [
          ...(blocks.get(currentBlock.name) || []),
          line
        ])
      }
    })

    const result = {}

    blocks.forEach((allLines, name) => {
      const block = config.blocks.find(b => b.name === name)

      let [first, ...lines] = allLines
      let value: any = ''

      if (block.type === 'object') {
        value = markdownListToObject(lines.filter(l => l !== '').join('\n'))
      }

      if (block.type === 'list') {
        value = markdownListToArray(lines.filter(l => l !== '').join('\n'))
      }

      if (block.merge && block.type === 'object') {
        result[block.name] = first.replace(/#+ /g, '')
        Object.assign(result, value)
        return
      }

      if (!block.type || block.type === 'text') {
        value = strings.trim(lines.join('\n'))
      }

      result[block.name] = value
    })

    return result
  }

  return {
    fileToObject
  }
}

export default (toolbox: GluegunToolbox) => {
  toolbox.markdown = createMarkdown(toolbox)
}
