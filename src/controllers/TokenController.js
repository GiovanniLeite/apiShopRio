import jwt from 'jsonwebtoken';
import Address from '../models/Address';
import User from '../models/User';

class TokenController {
  async store(req, res) {
    const { email = '', password = '' } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        errors: ['Credenciais inválidas'],
      });
    }

    const user = await User.findOne({
      order: [[Address, 'id', 'DESC']],
      include: {
        model: Address,
      },
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        errors: ['Email inválido ou Usuário não existe'],
      });
    }

    if (!(await user.passwordIsValid(password))) {
      return res.status(401).json({
        errors: ['Senha inválida'],
      });
    }

    const { id, adm } = user;
    const token = jwt.sign({ id, email, adm }, process.env.TOKEN_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRATION,
    });

    user.password_hash = '';
    return res.json({
      token,
      user,
    });
  }
}

export default new TokenController();
