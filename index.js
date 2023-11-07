import path from 'path';
import * as url from 'url';
import Koa from 'koa';
import serve from 'koa-static';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = new Koa;
app.use(serve('public'));

app.listen(3003);
