import DbSet from './db-set'
import * as Metadata from '../metadata'

export default class DbContext {
    constructor() {
        const sets = Metadata.dbset(this.constructor)
        for (const { key, type } of sets)
            this[key] = new DbSet<typeof type>({ type, context: this })
    }
}
