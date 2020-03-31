import { RequestHandler } from 'express';

const isAdminMiddleware: RequestHandler = ((req, res, next) => {
  if (!req.user.is_admin) {
    res.status(401).json({ msg: 'Cannot process the request for now.' });
    return;
  }

  next();
}) as RequestHandler;

const defaultExport = {
  isAdminMiddleware,
};

export default defaultExport;
export { isAdminMiddleware };
