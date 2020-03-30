import { RequestHandler } from 'express';
import { gets } from '../utils';

interface OpenDBResponse {
  response_code: number;
  results: [];
}

const get: RequestHandler = async (req, res) => {
  try {
    const openDBResponse = await gets<OpenDBResponse>(
      'https://opentdb.com/api.php?amount=10&category=21&difficulty=medium&type=multiple',
    );

    if (!(openDBResponse?.results?.length > 0)) {
      throw Error('Cannot process the request for now.');
    }

    res.status(200).json({ success: true, results: openDBResponse.results });
  } catch (e) {
    console.log('quiz get e', e);
    res.status(500).send('Something went wrong!');
  }
};

const controller = { get };

export default controller;
export { get };
