#!/usr/bin/env node

const fs = require('fs');
const sqlite3 = require('sqlite3');
const rss_parser = require('rss-parser');

const config = require('./package.json');

const usage = `Usage: ${process.argv[1]} <input>.json <output>.db`;

const sqlite_close_promise = (db) => new Promise((resolve, reject) => (
  db.close((error) => (error) ? reject(error) : resolve())
));

const sqlite_get_promise = (db, sql, params) => new Promise((resolve, reject) => (
  db.get(sql, params, (error, row) => (error) ? reject(error) : resolve(row))
));

const sqlite_all_promise = (db, sql, params) => new Promise((resolve, reject) => (
  db.all(sql, params, (error, rows) => (error) ? reject(error) : resolve(rows))
));

const sqlite_run_promise = (db, sql, params) => new Promise((resolve, reject) => (
  db.run(sql, params, function(error) { return (error) ? reject(error) : resolve({
    id: this.lastID, changes: this.changes
  }); })
));

const rss_parse_url_promise = (url) => new Promise((resolve, reject) => (
	rss_parser.parseURL(url, (error, result) => (!error) ? resolve(result) : reject(error))
));

const file_read_promise = (filename, options) => new Promise((resolve, reject) => (
	fs.readFile(filename, options, (error, data) => (!error) ? resolve(data) : reject(error))
));

async function main(config) {
	const feeds_db = new sqlite3.Database(config.output, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
	const input = JSON.parse(await file_read_promise(config.input, 'utf8')), subscriptions = input.subscriptions;

	try {

		await sqlite_run_promise(feeds_db, 'CREATE TABLE IF NOT EXISTS feed (feed_id TEXT PRIMARY KEY, link TEXT, title TEXT, description TEXT)');
		await sqlite_run_promise(feeds_db, 'CREATE TABLE IF NOT EXISTS entry (entry_id TEXT PRIMARY KEY, feed_id TEXT, link TEXT, title TEXT, pub_date TEXT, iso_date TEXT, creator TEXT, content TEXT, summary TEXT, categories TEXT)');

		for(const subscription of subscriptions) {
			try {
				const content = await rss_parse_url_promise(subscription.url), feed = content.feed;
				console.log("FEED:", feed.title);
				await sqlite_run_promise(feeds_db, 'INSERT OR IGNORE INTO feed(feed_id, link, title, description) VALUES (?, ?, ?, ?)', [subscription.url, feed.link, feed.title, feed.description]);
				for(const entry of feed.entries) {
					console.log(JSON.stringify(entry, null, 2));
					await sqlite_run_promise(feeds_db, 'INSERT OR IGNORE INTO entry(entry_id, feed_id, link, title, pub_date, iso_date, creator, content, summary, categories) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [entry.guid, subscription.url, entry.link, entry.title, entry.pubDate, entry.isoDate, entry.creator, entry.content, entry.contentSnippet, entry.categories]);
				}
			} catch(error) {
				console.error(error.stack || error);
			}
		}

	} finally {
		if(feeds_db) await sqlite_close_promise(feeds_db);
	}	
}

if(process.argv.length === 4) {
	main(Object.assign(config, {input: process.argv[2], output: process.argv[3]})).catch((error) => {
		console.error(error.stack || error);
		process.exit(1);
	});
} else {
	console.error(usage);
	process.exit(1);
}
