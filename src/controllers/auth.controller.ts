import { Request, Response } from 'express';
import { AppDataSource } from '../config/datasource';
import { User } from '../entities/User';
import { AuthService } from '../services/auth.service';

const repo = AppDataSource.getRepository(User);
const authService = new AuthService(repo);

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const { fullName, birthDate, email, password, role } = req.body;

            const safeUser = await authService.register({
                fullName,
                birthDate,
                email,
                password,
                role,
            });

            return res.status(201).json(safeUser);
        } catch (err: any) {
            if (err.message === 'Email already used') {
                return res.status(400).json({ message: err.message });
            }

            console.error('AuthController.register error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);
            return res.json(result);
        } catch (err: any) {
            if (err.message === 'Invalid credentials') {
                return res.status(401).json({ message: err.message });
            }

            if (err.message === 'User is blocked') {
                return res.status(403).json({ message: err.message });
            }

            console.error('AuthController.login error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
