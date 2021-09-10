// Import the Client component of the Notion SDK port for deno and RSS Parser.
import { Client } from 'https://deno.land/x/notion_sdk@v0.3.1/src/mod.ts';
import { parseFeed } from 'https://deno.land/x/rss@0.5.3/mod.ts';

// Import Notion Types
import {
  NumberPropertyValue,
  TitlePropertyValue,
  URLPropertyValue,
} from 'https://deno.land/x/notion_sdk@v0.3.1/src/api-types.ts';
import { FeedEntry } from 'https://deno.land/x/rss@0.5.3/src/types/feed.ts';

// Import the .env file.
import 'https://deno.land/x/dotenv@v3.0.0/load.ts';

// Create a new client instance.
const notion = new Client({
  auth: Deno.env.get('NOTION_TOKEN'),
});

// Get the databases ID from the environment variable.
const feedsDB = Deno.env.get('NOTION_FEEDS_DB_ID'); // Database who contains the RSS feeds URL.
const postsDB = Deno.env.get('NOTION_POSTS_DB_ID'); // Database who will contain the posts.

// Notions database templates:
// FeedsDB : https://diamantdev.notion.site/81a9daf4980148ce8454e5174a1b8315?v=6794a5c9756c4848bb87e9eeb63b3dcd
// PostDB : https://diamantdev.notion.site/7cdd480c179a44c38a7a6881e9050216?v=8a9941ad1cb84c42a1bb07f89cf66ff5

// Detect if feedsDB and postsDB are not undefined.
if (!feedsDB && !postsDB) {
  throw new Error(
    'You must provide the Notion database ID for the feeds and posts.'
  );
}

// Get the feeds URL from the feedsDB.

const feedsDBdata = await notion.databases.query({
  database_id: feedsDB as string,
  sorts: [{ property: 'priority', direction: 'ascending' }],
});

const feedsURL = feedsDBdata.results.map((feed) => {
  const feedURL = feed.properties.url as URLPropertyValue;
  const feedName = feed.properties.name as TitlePropertyValue;
  const feedPriority = feed.properties.priority as NumberPropertyValue;

  if (feedURL) {
    const Title = feedName.title.map((title) => title.plain_text).join('');
    const URL = feedURL.url ? feedURL.url : '';
    const Priority = feedPriority.number ? feedPriority.number : 0;
    return { Title, URL, Priority };
  }
});

if (feedsURL.length === 0) {
  throw new Error('No feeds found in the database.');
}

// Get all the posts from the feedsURL with an interval

const interval = 1000 * 60 * 60 * 24; // 1 day
const articles: { Title: string; Priority: number; articles: FeedEntry[] }[] =
  [];
for await (const feed of feedsURL) {
  const Title = feed?.Title as string;
  const URL = feed?.URL as string;
  const Priority = feed?.Priority || 0;
  const feedArticles = await fetch(URL);
  const xml = await feedArticles.text();
  const feedJSON = await parseFeed(xml);
  const filteredArticles = feedJSON.entries.filter(
    (article) =>
      article.published != undefined &&
      article.published.getTime() >= Date.now() - interval
  );
  articles.push({ Title, Priority, articles: [...filteredArticles] });
}

// Create a new post for each article in articles.

for (const articleW of articles) {
  const realArticle = articleW.articles;
  for (const article of realArticle) {
    await notion.pages.create({
      parent: { database_id: postsDB as string },
      properties: {
        name: {
          type: 'title',
          title: [
            {
              type: 'text',
              text: { content: (article.title?.value as string) || '' },
            },
          ],
        },
        URL: {
          type: 'url',
          url: (article.links?.[0]?.href as string) || '',
        },
        author: {
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: (article.author?.name as string) || '',
              },
            },
          ],
        },
        date: {
          type: 'date',
          date: {
            start: article.published?.toISOString() as string,
          },
        },
        origin: {
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: articleW.Title,
              },
            },
          ],
        },
        priority: {
          type: 'number',
          number: articleW.Priority,
        },
      },
    });
  }
}

console.log('Done!');
