import awsServerlessExpress from 'aws-serverless-express';
import app from './app';

const server = awsServerlessExpress.createServer(app);

export default (event, context) => awsServerlessExpress.proxy(server, event, context);
