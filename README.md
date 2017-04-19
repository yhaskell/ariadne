# Ariadne
Ariadne is an ORM for TypeScript and Node.js.
It will support different SQL dialect and features solid transaction support, relations, read replication and more.

It will also support extensibility through providers, so it would be possible to implement usage of every possible source.

Migrations will also be supported.

Currently it's in 'proof of concept' status and probably will be in such status for some time.

Example:

```typescript

import { DbContext, DbSet } from 'ariadne'
import { dbset, field, primary } from 'ariadne/decorators'
import 'ariadne-provider-dummy'

class User {
    @primary() public id: number /* specify a primary key */

    @field() email: string
    @field() password: string
}

class MyDbContext extends DbContext { /* This context will be used to provide access to data */
    @dbset(User) users: DbSet<User>
}

const dc = new MyDbContext('dummy://localhost/testdb') 
/*  Connected to testdb on localhost:8246
    Connection id: 1f2fcff9-1377-4d47-96a9-506d4523e0f2 */

/* Currently it just outputs things it will select */

dc.users.values()  
/*  on connection 1f2fcff9-1377-4d47-96a9-506d4523e0f2
    on table users
    get all elements */


dc.users
    .where.email.eql('vasya@pupkin.com')
    .or.email.eql('vasya.pupkin@gmail.com')
    .values()       
/*  on connection 1f2fcff9-1377-4d47-96a9-506d4523e0f2
    on table users
    get all elements with following constraints:
    email = "vasya@pupkin.com"
    or email = "vasya.pupkin@gmail.com" */

dc.users
    .where.id.eql(42)
    .where.email.eql('root@root.root')
    .values()       
/*  on connection 1f2fcff9-1377-4d47-96a9-506d4523e0f2
    on table users
    get all elements with following constraints:
    email = "root@root.root" */

dc.users
    .where.id.between(24, 42)
    .values()       
/*  on connection 1f2fcff9-1377-4d47-96a9-506d4523e0f2
    on table users
    get all elements with following constraints:
    id between "24" and "42" */

dc.users
    .where.email.in(['vasya@pupkin.com', 'vasya.pupkin@gmail.com', 'vasya.pupkin@outlook.com'])
    .values()       
/*  on connection 1f2fcff9-1377-4d47-96a9-506d4523e0f2
    on table users
    get all elements with following constraints:
    email in ("vasya@pupkin.com", "vasya.pupkin@gmail.com", "vasya.pupkin@outlook.com") */
```
