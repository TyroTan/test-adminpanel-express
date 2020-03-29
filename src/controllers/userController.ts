import { Response, RequestHandler } from 'express';
import { User } from '../db/models';

const get: RequestHandler = async (req, res): Promise<Response> => {
  try {
    const users = await User.findAll();
    return res.json({ msg: 'user rout!', data: users });
  } catch (e) {
    console.log('users/ e', e);
    return res.status(500).send('Something went wrong!');
  }
};

const controller = { get };

export default controller;
export { get };
