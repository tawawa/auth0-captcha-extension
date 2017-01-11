import express  from 'express'
import metadata from './webtask.json';
import auth0    from 'auth0-oauth2-express'
import routes   from './routes';

const app = express();

app.use('/.extensions', require('./hooks'));
app.use(routes);

export default app;
