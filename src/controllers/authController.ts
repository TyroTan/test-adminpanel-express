import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/models';
import { AUTH_SECRET } from '../config';

type UserSession = Partial<User>;

const userToUserSessionObject = (user: User): UserSession => {
  return {
    user_id: user.user_id,
    email: user.email,
    is_admin: user.is_admin,
  };
};

const register: RequestHandler = async (req, res) => {
  try {
    const alreadyExists = await User.findOne({
      where: { email: req.body.email },
    });

    if (alreadyExists?.user_id) {
      res.status(422).send({ msg: 'User already exists' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    const user = await User.create({
      email: req.body.email,
      name: req.body?.name ?? '',
      password: hashedPassword,
    });

    const token = jwt.sign(userToUserSessionObject(user), AUTH_SECRET, {
      expiresIn: 86400, // expires in 24 hours
    });

    res.status(200).send({ ...userToUserSessionObject(user), token });
  } catch (e) {
    console.log('user register e', e);
    res.status(500).send('Something went wrong!');
  }
};

const login: RequestHandler = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user?.user_id) {
      return res.status(422).json({
        msg: 'Invalid username/password.',
      });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password,
    );
    if (!passwordIsValid) {
      return res.status(422).json({
        msg: 'Invalid username/password.',
      });
    }

    const token = jwt.sign(userToUserSessionObject(user), AUTH_SECRET, {
      expiresIn: 86400, // expires in 24 hours
    });

    console.log('right', { ...userToUserSessionObject(user), token });

    return res.status(200).send({ ...userToUserSessionObject(user), token });
  } catch (e) {
    console.log('user register e', e);
    return res.status(500).send('Something went wrong!');
  }
};

const me: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.Authorization;
    if (!token)
      return res
        .status(401)
        .send({ auth: false, message: 'No token provided.' });

    const decoded = jwt.verify(token as string, AUTH_SECRET);

    return res.status(200).send({ auth: true, decoded });
  } catch (e) {
    console.log('user register e', e);
    return res.status(500).send('Something went wrong!');
  }
};

const controller = { register, me, login };

export default controller;
export { register, login };
