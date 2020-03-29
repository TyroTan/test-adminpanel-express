import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/models';
import { AUTH_SECRET } from '../config';

const register: RequestHandler = async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    const user = await User.create({
      email: req.body.email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user.user_id }, AUTH_SECRET, {
      expiresIn: 86400, // expires in 24 hours
    });

    res.status(200).send({ auth: true, token });
  } catch (e) {
    console.log('user register e', e);
    res.status(500).send('Something went wrong!');
  }
};

const controller = { register };

export default controller;
export { register };
