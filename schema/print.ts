import * as chalk from 'chalk'
import { Schema, DataType } from './index'
import * as leftpad from 'leftpad'


export default function print(schemas: Map<string, Schema>) {
    const bl = {
        blob: chalk.bold.cyan('['),
        blcb: chalk.bold.cyan(']'),
        rob: chalk.bold.red('{'),
        rcb: chalk.bold.red('}'),
    }

    const h1 = (text: string) => chalk.bold.grey.underline(text)
    const h1l = (text: string) => console.log(h1(text))
    const schemaName = (name: string) => `${bl.blob}${chalk.bold.red(name)}${bl.blcb}`

    let fln = 0
    for (let [name, schema] of schemas) {
        const ffln = schema.fields.reduce((p, c) => p < c.name.length ? c.name.length : p, 0)
        const ffkln = schema.links.reduce((p, c) => p < c.field.name.length ? c.field.name.length : p, 0)
        if (fln < ffln) fln = ffln
        if (fln < ffkln) fln = ffkln
    }
    for (let [name, schema] of schemas) {
        console.log(`${chalk.bold('Schema')} ${schemaName(name)}:`)
        h1l("Fields:")

        schema.fields.forEach(field => {
            console.log(`  ${leftpad(field.name, fln, ' ')}: ${bl.rob} ${field.dbName}: ${chalk.bold.yellow(field.type.typeName)} ${bl.rcb}`)
        })
        
        console.log(`\n${h1("Primary keys:")} ${schema.primaryKeys.map(pk => chalk.bold.magenta(pk.name)).join(', ')}`)

        if (schema.links.length) {        
            h1l("\nLinks:")

            schema.links.forEach(link => {
                console.log(`  ${leftpad(link.field.name, fln, ' ')}: ${bl.rob} ${chalk.bold.grey('FK')} ${link.key.dbName} ${bl.rcb} ${chalk.red("=>")} ${schemaName(<string>link.foreignSchema)}`)
            })

            console.log()
        }
    }
}