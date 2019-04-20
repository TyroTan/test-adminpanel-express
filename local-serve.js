/* eslint-disable import/no-extraneous-dependencies */
import 'source-map-support/register';
import app from './app';

// eslint-disable-next-line no-console
app.listen(8080, () => console.log('Server running on http://localhost:8080/'));
