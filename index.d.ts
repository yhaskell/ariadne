import 'reflect-metadata';

declare module "ariadne" {
    export class DbContext {
        constructor();
    }

    type Selector<T> = {
        [K in keyof T]: Where<T, T[K]>;
    };
    export class DbSet<T> {
        where: Selector<T>;
        protected readonly tableName: any;
        values(): Promise<string>;
        protected getFields(): {
            key: string;
            name: string;
            primary: boolean;
        }[];
        protected generate(bgn: string): Selector<T>;
        constructor(typeFor: Function);
    }
    class ConstrainedDbSet<T> extends DbSet<T> {
        or: Selector<T>;
        private constraints;
        constructor(previous: DbSet<T>, additionalConstraints?: string[]);
        values(): Promise<string>;
    }
    class Where<T, K> {
        private previous;
        private field;
        private begin;
        constructor(previous: DbSet<T>, field: string, begin: string);
        eql(value: K): ConstrainedDbSet<T>;
        greater(value: K): ConstrainedDbSet<T>;
        less(value: K): ConstrainedDbSet<T>;
        between(from: K, to: K): ConstrainedDbSet<T>;
        in(values: K[]): ConstrainedDbSet<T>;
    }

}