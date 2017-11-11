# feed-aggregator
Feed aggregator (RSS)

## Installation 

 * Install NodeJS 9 or higher from: https://nodejs.org

 * Clone this project from github to a directory on your computer

 * Execute the following inside the cloned directory using the command-line: `npm install`

## Dependencies

 * NodeJS >9

## Examples

The following, when run from the command-line inside the cloned directory, will aggregate all court feeds into one:

```
./feed-aggregator us-courts.json us-courts-feed.db
```

Export to CSV by running `sqlite3 us-courts-feed.db` and then:

```
.headers on
.mode csv
.output us-courts-feed.csv
select * from entry order by iso_date
.quit
```

