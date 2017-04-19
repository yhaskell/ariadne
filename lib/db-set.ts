import DbContext from './db-context'
import * as Metadata from '../metadata'
export type Selector<T> = { [K in keyof T]: Where<T, T[K]> }

export default class DbSet<T> {
    where: Selector<T>

    private options: {
        context: DbContext
        dataType: Function
        tableName: string
    }
    protected get tableName() {
        return Metadata.tableName(this.options.dataType)
    }

    async values() {
        const query = `select * from ${this.tableName}`
        console.log("QUERY: " + query)
        return query
    }

    protected getFields(): Metadata.FieldMetadataWithKey[] {
        return Metadata.fields(this.options.dataType)
    }
    protected generate(bgn: string): Selector<T> {
        const fields = this.getFields()
        let ret = {}
        for (let field of fields)
            ret[field.key] = new Where(this, field.name, bgn)
        
        return <Selector<T>>ret;
    }

    constructor(options:{ type: Function; context: DbContext });
    constructor(previous: DbSet<T>);
    constructor(prevopts: DbSet<T> | { type: Function; context: DbContext, tableName?: string } ) {
        if (prevopts instanceof DbSet) {
            this.options = prevopts.options
            this.where = prevopts.where
        } else {
            this.options = {
                context: prevopts.context,
                dataType: prevopts.type,
                tableName: prevopts.tableName || Metadata.tableName(prevopts.type)
            }
            this.where = this.generate("and");
        }
        
    }

}

export class ConstrainedDbSet<T> extends DbSet<T> {
    
    get or(): Selector<T> {
        const orKey = Symbol.for("ariadne:dbset:constrained")
        return this[orKey] || (this[orKey] = this.generate("or"))
    }

    private constraints: string[];

    constructor(previous: DbSet<T>, additionalConstraints: string[] = []) {
        super(previous)
        
        const prevConstraints = (previous instanceof ConstrainedDbSet ? previous.constraints : ['true'])
        this.constraints = prevConstraints.concat(additionalConstraints)
    }

    async values() {
        const clause = this.constraints.join(" ").replace("true and ", "")
        const query = `select * from ${this.tableName} where ${clause}`
        console.log("QUERY: " + query)
        return query
    }

}


export class Where<T, K> {
    constructor(private previous: DbSet<T>, private field: string, private begin: string) {
        this.not = new WhereNot(previous, field, begin)
    }
    
    not: WhereNot<T, K>
    eql(value: K):  ConstrainedDbSet<T> {
        const next = new ConstrainedDbSet<T>(this.previous, [`${this.begin} ${this.field} = "${value}"`])
        return next;
    }
    greater(value: K):  ConstrainedDbSet<T> {
        const next = new ConstrainedDbSet<T>(this.previous, [`${this.begin} ${this.field} > "${value}"`])
        return next;
    }
    less(value: K):  ConstrainedDbSet<T> {
        const next = new ConstrainedDbSet<T>(this.previous, [`${this.begin} ${this.field} < "${value}"`])
        return next;
    }
    between(from: K, to: K):  ConstrainedDbSet<T> {
        const next = new ConstrainedDbSet<T>(this.previous, [`${this.begin} ${this.field} between "${from}" and "${to}"`])
        return next;
    }
    in(values: K[]): ConstrainedDbSet<T> {
        const valuesStr = values
            .map(v => `"${v}"`)
            .join(', ')
        const next = new ConstrainedDbSet<T>(this.previous, [`${this.begin} ${this.field} in (${valuesStr})`])
        return next;
    }
}

export class WhereNot<T, K> {
    constructor(private previous: DbSet<T>, private field: string, private begin: string) {}
    eql(value: K):  ConstrainedDbSet<T> {
        const next = new ConstrainedDbSet<T>(this.previous, [`${this.begin} ${this.field} != "${value}"`])
        return next;
    }
    greater(value: K):  ConstrainedDbSet<T> {
        const next = new ConstrainedDbSet<T>(this.previous, [`${this.begin} ${this.field} <= "${value}"`])
        return next;
    }
    less(value: K):  ConstrainedDbSet<T> {
        const next = new ConstrainedDbSet<T>(this.previous, [`${this.begin} ${this.field} >= "${value}"`])
        return next;
    }
    between(from: K, to: K):  ConstrainedDbSet<T> {
        const next = new ConstrainedDbSet<T>(this.previous, [`${this.begin} ${this.field} not between "${from}" and "${to}"`])
        return next;
    }
    in(values: K[]): ConstrainedDbSet<T> {
        const valuesStr = values
            .map(v => `"${v}"`)
            .join(', ')
        const next = new ConstrainedDbSet<T>(this.previous, [`${this.begin} ${this.field} not in (${valuesStr})`])
        return next;
    }
}
