import 'reflect-metadata'
import * as Metadata from '../metadata'
export declare function model(tableName: any): (target: any) => void;
export declare function dbset(type: Function): (target: any, key: string) => void;
export declare function field(options?: Metadata.FieldMetadata): (target: any, key: string) => void;
export declare function primary(name?: string, type?: Function): (target: any, key: string) => void;
