import { basename, dirname } from 'path'
import { filesystem, strings } from 'gluegun'
import defaultConfig from '../default-config'
import { MarkdownItem, CatalogItem } from './markdown-item'

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

export function markdownListToArray(content: string[]) {
  return content
    .filter(l => l !== '')
    .map(i => i.replace(/[- ]+ /g, ''))
    .map(item => {
      const isLink = /\(.*?\)/.test(item) && /\[.*?\]/.test(item)

      if (isLink) {
        const [text, link] = item.split('](')

        if (text && link) {
          return {
            text: text ? text.slice(1) : text,
            link: link ? link.slice(0, link.length - 1) : link
          }
        }
      }

      return item
    })
}

export function fileToObject<T = any>(filename: string) {
  const config = defaultConfig.files.find(c => filename.match(c.patter))

  if (!config) return

  const content = filesystem.read(filename)

  const result: any = {}

  const parsers = {
    object: markdownListToObject,
    list: markdownListToArray,
    text: (lines: string[]) => lines.join('\n').trim()
  }

  content.split('\n').forEach((line, index, allLines) => {
    const entry = Object.entries(config.schema).find(([_, value]) =>
      value.lineTest(line)
    )

    if (!entry) return

    const [name, options] = entry

    let value: any = line

    if (options.lineEndTest) {
      const restOfLines = allLines.slice(index + 1, allLines.length)

      const lastLineIndex = restOfLines.findIndex(
        (l, i, array) => options.lineEndTest(l) || i === array.length - 1
      )

      value = restOfLines
        .slice(0, lastLineIndex)
        .reduce((all, l) => all.concat(l), [])
    }

    if (parsers[options.type]) {
      value = parsers[options.type](value)
    }

    if (options.format) {
      value = options.format(value)
    }

    result[name] = value
  })

  return result as T
}

export async function mountItem(filename: string) {
  const content = await fileToObject(filename)

  const item = MarkdownItem.mount({
    ...content,
    filename,
    folderName: basename(dirname(filename)),
    itemName: basename(filename),
    template: filesystem.read(
      filesystem.resolve(__dirname, '..', 'templates', 'item.edge')
    )
  })

  return item as MarkdownItem & CatalogItem
}

export function createMarkdown() {
  return {
    fileToObject,
    mountItem
  }
}
