# Feed Aggregator
Feed aggregator (RSS)

## Installation 

 * Install NodeJS 9 or higher from: https://nodejs.org

 * Clone this project from github to a directory on your computer

 * Execute the following inside the cloned directory using the command-line: `npm install`

## Dependencies

 * Sqlite 3 (if you want to export to CSV)
 * NodeJS 9 or higher

## Examples

The following, when run from the command-line inside the cloned directory, will aggregate all court feeds into one:

```
./feed-aggregator us-courts.json us-courts-feed.db
```

The above can be executed multiple times and only new entries will be added.

Export to CSV by running `sqlite3 us-courts-feed.db` and then:

```
.headers on
.mode csv
.output us-courts-feed.csv
select * from entry order by iso_date
.quit
```

