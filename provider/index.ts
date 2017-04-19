import DbSet from '../lib/db-set'
import { parse, Url } from 'url'

export interface IProvider {
    connect(): void
    resolve<T>(dbset: DbSet<T>): Promise<T[]>
}

export interface IProviderFactory {
    resolve(connectionString: string): IProvider
    resolve(connectionUrl: Url): IProvider

    protocol: string
}


var $providers = Symbol("ariadne:providers")
export class ProviderService {
    static register(factory: IProviderFactory) {
        const factoryMap = <Map<string, IProviderFactory>> (global[$providers] || (global[$providers] = new Map<string, IProviderFactory>()))
        factoryMap.set(factory.protocol, factory)
    }

    static getFactory(protocol: string) {
        const factoryMap = <Map<string, IProviderFactory>> (global[$providers] || (global[$providers] = new Map<string, IProviderFactory>()))
        return factoryMap.get(protocol)
    }

    static connect(connectionString: string): IProvider {
        const connUrl = parse(connectionString)
        const factory = this.getFactory(connUrl.protocol.replace(':', ''))
        if (!factory) throw Error(`No provider for ${connUrl.protocol} protocol.`)
        const resolved = factory.resolve(connUrl)
        resolved.connect()
        return resolved
    }
}

global[Symbol.for("ariadne:provider:service")] = ProviderService