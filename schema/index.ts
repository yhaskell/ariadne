import { FieldMetadata } from '../metadata';
import { primary } from '../decorators';
import DbContext from '../lib/db-context'
import DbSet from '../lib/db-set'
import * as Metadata from '../metadata'


export class DataType {
    constructor(public typeName: string) { }
    toString() { return this.typeName }
    static Integer  = new DataType("INTEGER")
    static Float    = new DataType("FLOAT")
    static String   = new DataType("STRING")
    static DateTime = new DataType("DATETIME")
    static Boolean  = new DataType("BOOLEAN")
    static Object  = new DataType("OBJECT_LINK")

    /** Functional type into DataType */
    static convert(type: Function): DataType {
        switch (type) {
            case Boolean: 
                return DataType.Boolean
            case Number:
                return DataType.Float
            case String:
                return DataType.String
            case Date:
                return DataType.DateTime
            default:
                return DataType.Object
        }
    }
}

/**
 * Table field representation
 */
export interface Field {
    /**
     * Name used in a mapped js object
     */
    name: string
    /**
     * Field name in the database schema
     */
    dbName: string
    /**
     * Field data type
     */
    type: DataType
}


type SchemaRef = Function | string
/**
 * Foreign key Link Representation
 */
export interface IsomophicLink {
    /**
     * Field that is a foreign key
     */
    key: Field
    /**
     * Field containing real value
     */
    field: Field
    /**
     * Schema we link into
     */
    foreignSchema: SchemaRef
}

// TODO: Make them
// interface ArrayLink {
    
//     localField: Field
//     foreignSchema: Schema
//     backLink: IsomophicLink
// }

/**
 * Database Table representation
 */
export interface Schema {
    /** 
     * Table name 
     */
    name: string
    /**
     * Field list
     */
    fields: Field[]
    /**
     * Primary key
     */
    primaryKeys: Field[]
    /**
     * Links to other tables
     */
    links: IsomophicLink[]
//    arrayLinks: ArrayLink[]
}


function modelToSchema(model: Function, key?: string): { schema: Schema; more: Function[] } {
    const name = key || Metadata.tableName(model)
    const fieldsMd = Metadata.fields(model)

    const md2Field = (field: Metadata.FieldMetadataWithKey): Field => ({
        name: field.name,
        dbName: field.key,
        type: DataType.convert(field.type)
    })

    const fields = fieldsMd.map(md2Field)
    const primaryKeys = fieldsMd.filter(md => md.primary).map(md2Field)

    const schema: Schema = {
        name, 
        fields,
        primaryKeys,
        links: []
    }

    const objects = fieldsMd.filter(md => DataType.convert(md.type) == null)

    const more = objects.map(md => md.type)
    schema.links = objects.map(obj => (<IsomophicLink>{
        field: schema.fields.find(f => f.name == obj.name),
        key: { dbName: `${obj.key || obj.name}_id`, name: null, type: DataType.Integer },
        foreignSchema: obj.type
    }))
    return {
        schema,
        more
    }
}

function transitive(t2s: Map<Function, Schema>) {
    let done = true
    for (let [key, value] of t2s.entries()) {
        if (value) continue
        done = false
        let u = modelToSchema(key)
        u.more
            .filter(m => !t2s.has(m))
            .forEach(m => t2s.set(m, null))
    }
    if (!done) transitive(t2s)
}

export function generate(context: DbContext): Map<string, Schema> {
    const type2schema = new Map<Function, Schema>()
    const unresolved = new Set<Function>()
    Metadata.dbset(context.constructor).forEach(({key, type}) => {
        let u = modelToSchema(type, key)
        type2schema.set(type, u.schema)
        u.more.forEach(m => unresolved.add(m))
    })
    unresolved.forEach(u => {
        if (type2schema.has(u) == false) type2schema.set(u, null)
    })

    transitive(type2schema)

    const schemaList = Array.from(type2schema.values())
    var schemas = new Map<string, Schema>(schemaList.map(schema => <[string, Schema]>[schema.name, schema]))
    
    Array.from(schemaList).forEach(
        schema => schema.links.forEach(
            link => link.foreignSchema = link.foreignSchema instanceof Function ? type2schema.get(link.foreignSchema).name : link.foreignSchema))
    
    return schemas
}