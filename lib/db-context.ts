import DbSet from './db-set'
import { $dbSets } from '../symbols'

export default class DbContext {
    constructor() {
        const sets = Reflect.getMetadata($dbSets, this.constructor)
        for (const { key, type } of sets)
            this[key] = new DbSet<typeof type>(type)
    }
}