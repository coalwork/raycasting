import path from 'path';
import * as url from 'url';
import Koa from 'koa';
import serve from 'koa-static';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = new Koa;
const port = process.ENV?.PORT || 3003;
app.use(serve('public'));

console.log(`app listening on port ${port}`);
app.listen(port);
