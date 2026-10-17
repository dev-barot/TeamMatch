import { Router } from 'express';
import {
  SignUpDto,
  LogInDto,
  VerifyEmailDto,
  RefreshTokenDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
} from '../dto/identityDto.js';
import {
  AccountAlreadyExistsError,
  InvalidCredentialsError,
  AccountDeactivatedError,
  InvalidTokenError,
  TokenExpiredError,
} from '../../domain/identity/errors.js';

export function createAuthRouter({
  signUpUseCase,
  verifyEmailUseCase,
  logInUseCase,
  refreshAccessTokenUseCase,
  requestPasswordResetUseCase,
  resetPasswordUseCase,
}) {
  const router = Router();

  router.post('/signup', async (req, res) => {
    const parse = SignUpDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const student = await signUpUseCase.execute(parse.data);
      res.status(201).json({
        message: 'Account created. Please check your email to verify your account (R5).',
        student,
      });
    } catch (err) {
      if (err instanceof AccountAlreadyExistsError) {
        return res.status(409).json({ error: err.message });
      }
      res.status(500).json({ error: 'Failed to create account.' });
    }
  });

  router.post('/verify-email', async (req, res) => {
    const parse = VerifyEmailDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const result = await verifyEmailUseCase.execute(parse.data);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof InvalidTokenError || err instanceof TokenExpiredError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: 'Verification failed.' });
    }
  });

  router.post('/login', async (req, res) => {
    const parse = LogInDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const result = await logInUseCase.execute(parse.data);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return res.status(401).json({ error: err.message });
      }
      if (err instanceof AccountDeactivatedError) {
        return res.status(403).json({ error: err.message });
      }
      res.status(500).json({ error: 'Login failed.' });
    }
  });

  router.post('/refresh', async (req, res) => {
    const parse = RefreshTokenDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const result = await refreshAccessTokenUseCase.execute(parse.data);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof InvalidTokenError) {
        return res.status(401).json({ error: err.message });
      }
      if (err instanceof AccountDeactivatedError) {
        return res.status(403).json({ error: err.message });
      }
      res.status(500).json({ error: 'Token refresh failed.' });
    }
  });

  router.post('/request-password-reset', async (req, res) => {
    const parse = RequestPasswordResetDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const result = await requestPasswordResetUseCase.execute(parse.data);
      res.status(200).json(result);
    } catch {
      res.status(500).json({ error: 'Password reset request failed.' });
    }
  });

  router.post('/reset-password', async (req, res) => {
    const parse = ResetPasswordDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const result = await resetPasswordUseCase.execute(parse.data);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof InvalidTokenError || err instanceof TokenExpiredError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: 'Password reset failed.' });
    }
  });

  return router;
}
