# feed-aggregator
Feed aggregator (RSS)

## Example

The following will aggregate all court feeds into one:

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
