import https from 'https';

const gets = <T = []>(url: string): Promise<T> =>
  new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          const responseString = JSON.parse(body);
          return resolve(responseString);
        });
      })
      .on('error', reject);
  });

export default gets;
export { gets };
