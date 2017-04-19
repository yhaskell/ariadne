import { IProvider, IProviderFactory, ProviderService } from '../provider'
import { Url, parse } from 'url'
import { v4 as uuid } from 'uuid'
import DbSet, { ConstrainedDbSet } from "../lib/db-set";
import * as chalk from 'chalk'

export default class DummyProvider implements IProvider {
    connection: Url
    
    connId = uuid()

    constructor(connection: string | Url) {
        this.connection = typeof connection == 'string' ? parse(connection) : connection
    }

    connect() {
        // do nothing, I guess
        console.log(`Connected to ${chalk.bold.green(this.connection.path.replace('/', ''))} on ${chalk.bold.yellow(`${this.connection.host}:${(this.connection.port || 8246)}`)}`)
        console.log(`Connection id: ${chalk.bold.green(this.connId)}`)
        console.log()
    }
    resolve<T>(dbset: DbSet<T>): Promise<T[]> {
        console.log(`on connection ${chalk.bold.cyan(this.connId)}`)
        console.log(`on table ${chalk.red(dbset.options.tableName)}`)
        if (dbset instanceof ConstrainedDbSet) {
            console.log(`get all elements ${chalk.bold('with following constraints:')}`)
            const clause = dbset.constraints.join("\n").replace("true\nand ", "")
            console.log(clause)
        } else {
            console.log(`get all elements`)
        }
        console.log('---\n')
        return Promise.resolve([])
    }
}

export class DummyProviderFactory implements IProviderFactory {
    resolve(connection: Url | string): IProvider {
        return new DummyProvider(connection)
    }
    get protocol(): string { return 'dummy' }
}

ProviderService.register(new DummyProviderFactory())


// TODO: remove to 'ariadne-provider-dummy' package