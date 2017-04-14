import { DbContext, DbSet } from '../index' /* from 'ariadne' */
import { dbset, field, model } from '../decorators' /* from 'ariadne/decorators' */

import { createHash } from 'crypto'

const hash = (value: string) => createHash('sha256').update(value).digest('base64')

class User {
    @field('id', true) public id: number

    @field() email: string
    @field() passwordHash: string

    set password(value: string) { this.passwordHash = hash(value) }
}

enum Sex { Male, Female, Unspecified }

class Persona {
    @field('id', true) public id: number
    @field() name: string
    @field() sex: Sex
}

class MyDbContext extends DbContext {
    @dbset(User) users: DbSet<User>
    @dbset(Persona) personas: DbSet<Persona>
}

const dc = new MyDbContext()


Promise.all([
    dc.users,
    dc.users
        .where.email.eql('vasya@pupkin.com')
        .or.email.eql('vasya.pupkin@gmail.com'),
    dc.users
        .where.id.eql(42)
        .where.email.eql('root@root.root'),
    dc.personas
        .where.id.not.eql(24),
    dc.users
        .where.id.between(24, 42),
    dc.users
        .where.email.in(['vasya@pupkin.com', 'vasya.pupkin@gmail.com', 'vasya.pupkin@outlook.com']),
    dc.personas

].map(u => u.values())).then(values => {
    //console.log('returned ' + values)
    process.exit(0)
})
