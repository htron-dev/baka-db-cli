import edge from 'edge.js'
import { filesystem } from 'gluegun'
import { Schema } from '../default-config'
import { pick } from 'lodash'

export interface CatalogItem {
  [prop: string]: any
}

export class MarkdownItem {
  public itemName = ''

  public folderName = ''

  public filename = ''

  public template = ''

  public schema: Record<string, Schema> = {}

  public async save() {
    const content = await this.toString()

    filesystem.write(this.filename, content)
  }

  public toObject() {
    const exclude = Object.getOwnPropertyNames(new MarkdownItem())

    const keys = Object.keys(this).filter(k => !exclude.includes(k))

    return pick(this, keys)
  }

  public toString() {
    return edge.renderRaw(this.template, {
      ...this,
      $root: this
    })
  }

  public static mount(data: any) {
    const item = new this()

    Object.assign(item, data)

    return item
  }
}
