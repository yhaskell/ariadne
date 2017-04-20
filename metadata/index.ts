import * as pluralize from 'pluralize'
import DbSet from '../lib/db-set'

export function appendMetadata(sym: Symbol, convert: (key: string, type: Function) => any) {
    return (target, key: string) => {
        const elems = Reflect.getMetadata(sym, target.constructor) || []
        const ktype = convert ? Reflect.getMetadata('design:type', target, key) : null
        elems.push(convert ? convert(key, ktype) : key)
        Reflect.defineMetadata(sym, elems, target.constructor)
    }
}


/* tableName */
const $tableName = Symbol("ariadne:table-name")
export const tableName = target => <string> Reflect.getMetadata($tableName, target) || pluralize(target.name.toLowerCase())


/* field() */
export interface FieldMetadata {
    name?: string
    primary?: boolean
    type?: Function // maybe later we have to change it into something else
}

export interface FieldMetadataWithKey extends FieldMetadata { key: string }



const $fields = Symbol("ariadne:fields")
export const fields = target => <FieldMetadataWithKey[]> Reflect.getMetadata($fields, target)

/* dbsets */

const $dbSets = Symbol("ariadne:dbsets")
export const dbset = target => <{key: string; type: Function}[]>Reflect.getMetadata($dbSets, target)

export const decorators = {
    tableName: (name: string) => {
        (target: any) => Reflect.defineMetadata($tableName, name, target)
    },
    fields: (options: FieldMetadata) =>
        appendMetadata($fields, (key, type) => ({ 
            key, 
            name: options.name || key, 
            primary: options.primary, 
            type: options.type || type 
        })),
    dbset: (type: Function) =>
        appendMetadata($dbSets, key => ({key, type}))
    
}
