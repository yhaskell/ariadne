import DbSet from './db-set'
import * as Metadata from '../metadata'
import { IProvider, ProviderService } from '../provider'
export default class DbContext {
    provider: IProvider
    constructor(connectionString: string) {
        const sets = Metadata.dbset(this.constructor)
        for (const { key, type } of sets)
            this[key] = new DbSet<typeof type>({ type, context: this })

        this.provider = ProviderService.connect(connectionString)
    }
}
