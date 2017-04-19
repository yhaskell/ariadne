import 'reflect-metadata'
import * as Metadata from '../metadata'

export const model = Metadata.decorators.tableName

export const dbset = (type: Function) => Metadata.decorators.dbset(type)

export const field = (options?: Metadata.FieldMetadata) => Metadata.decorators.fields(options || {})
export const primary = (name?: string, type?: Function) => Metadata.decorators.fields({ primary: true, name, type})
