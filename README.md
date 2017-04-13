# Ariadne
Ariadne is an ORM for TypeScript and Node.js.
It will support different SQL dialect and features solid transaction support, relations, read replication and more.

It will also support extensibility through providers, so it would be possible to implement usage of every possible source.

Migrations will also be supported.

Currently it's in 'proof of concept' status and probably will be in such status for some time.

Example:

```typescript

import { DbContext, DbSet } from 'ariadne'
import { dbset, field, model} from 'ariadne/decorators'

@model('users') class User {
    @field('id', true) public id: number /* specify a primary key */

    @field() email: string
    @field() password: string
}

class MyDbContext extends DbContext { /* This context will be used to provide access to data */
    @dbset(User) users: DbSet<User>
}

const dc = new MyDbContext()
/* Currently it just outputs some SQL */
// select * from users
dc.users.values() 

// select * from users where email = "vasya@pupkin.com" or email = "vasya.pupkin@gmail.com"
dc.users
    .where.email.eql('vasya@pupkin.com')
    .or.email.eql('vasya.pupkin@gmail.com') 

// select * from users where id = "42" and email = "root@root.root"
dc.users
    .where.id.eql(42)
    .where.email.eql('root@root.root'),

// select * from users where id between "24" and "42"
dc.users
    .where.id.between(24, 42),

// select * from users where email in ("vasya@pupkin.com", "vasya.pupkin@gmail.com", "vasya.pupkin@outlook.com")
dc.users
    .where.email.in(['vasya@pupkin.com', 'vasya.pupkin@gmail.com', 'vasya.pupkin@outlook.com'])
```
