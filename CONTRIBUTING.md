# Contributing

We would be super happy if you want to help with bringing this
tool live.

## Setup project

Get the sourcecode and install its dependencies

```
git clone git@github.com:babel/phabricator-to-github.git .
npm i
```

The next step is to obtain a mysql dump from phabricator. You can
download one [here](https://drive.google.com/open?id=0B9zghAL0eXPVV2d4ZVAteU8xZUk).

Once you have a dump you need to convert and import it

```
./bin/phaway.js import-mysql-dump path/to/dump.sql
```

At this point your a completely set and can start working on writing the migration flows.
