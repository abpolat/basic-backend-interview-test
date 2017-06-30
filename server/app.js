import express from 'express';
import bodyParser from 'body-parser';
import nasa from './routes/nasa';
import './model/db';

let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', nasa);

/**
 * Note:
 * Written like this to be able to write tests for app;
 */
export default app;