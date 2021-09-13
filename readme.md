# RSS to Notion.

A Simple deno script to catch some RSS feeds and push it into a notion database.

[![GitHub issues](https://img.shields.io/github/issues/diamantdev/RSStoNotion?color=b69bc9&style=for-the-badge)](https://github.com/diamantdev/RSStoNotion/issues)
[![GitHub forks](https://img.shields.io/github/forks/diamantdev/RSStoNotion?color=b69bc9&style=for-the-badge)](https://github.com/diamantdev/RSStoNotion/network)
[![GitHub stars](https://img.shields.io/github/stars/diamantdev/RSStoNotion?color=b69bc9&style=for-the-badge)](https://github.com/diamantdev/RSStoNotion/stargazers)
[![GitHub license](https://img.shields.io/github/license/diamantdev/RSStoNotion?color=b69bc9&style=for-the-badge)](https://github.com/diamantdev/RSStoNotion)

## Authors

- [@diamantdev](https://www.github.com/diamantdev)

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

- `NOTION_TOKEN`
- `NOTION_FEEDS_DB_ID`
- `NOTION_POSTS_DB_ID`

## Deployment

To deploy this project run

```bash
  deno run --allow-env --allow-read=.env,.env.defaults --allow-net index.ts
```

## Run Locally

Clone the project

```bash
  git clone https://github.com/diamantdev/RSSToNotion RSStoNotion
```

Go to the project directory

```bash
  cd RSStoNotion
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

## Acknowledgements

- [Deno](https://deno.land)
- [Deno Notion SDK](https://github.com/cloudydeno/deno-notion_sdk)
- [Notion API](https://developers.notion.com/)
