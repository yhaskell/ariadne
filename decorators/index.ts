import 'reflect-metadata'
import { $tableName, $fields, $dbSets } from '../symbols'


function appendMetadata(sym: Symbol, convert: (key: string) => any) {
    return (target, key: string) => {
        const elems = Reflect.getMetadata(sym, target.constructor) || []
        elems.push(convert ? convert(key) : key)
        Reflect.defineMetadata(sym, elems, target.constructor)
    }
}

export function model(tableName) {
    return (target) => {
        Reflect.defineMetadata($tableName, tableName, target)
    }
}

export function field(name?: string, primary?: boolean) {
    return appendMetadata($fields, key => ({ key, name: name || key, primary }))
}

export function dbset(type: Function) {
    return appendMetadata($dbSets, key => ({key, type}))
}
