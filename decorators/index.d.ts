import 'reflect-metadata';
export declare function model(tableName: any): (target: any) => void;
export declare function field(name?: string, primary?: boolean): (target: any, key: string) => void;
export declare function dbset(type: Function): (target: any, key: string) => void;
