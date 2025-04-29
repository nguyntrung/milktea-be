import jwt from 'jsonwebtoken';

const generateToken = (userId: string): string => {
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  };
  
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, options);
};

const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};

export { generateToken, verifyToken };
