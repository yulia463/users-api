import { Response } from 'express';
import { AppDataSource } from '../config/datasource';
import { User } from '../entities/User';
import { UsersService } from '../services/users.service';

type AuthRequest = any;

const usersService = new UsersService(
    AppDataSource.getRepository(User)
);

export class UsersController {
    static async list(req: AuthRequest, res: Response) {
        try {
            const caller = req.user;
            if (!caller) return res.status(401).json({ message: 'Unauthorized' });
            if (caller.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

            const page = Math.max(1, parseInt(String(req.query.page || '1')));
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'))));

            const { items, total } = await usersService.findAll(page, limit);

            const safeItems = await Promise.all(
                items.map((u) => usersService.sanitize(u))
            );

            return res.json({
                data: safeItems,
                meta: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (err) {
            console.error('UsersController.list error', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getById(req: AuthRequest, res: Response) {
        try {
            const caller = req.user;
            if (!caller) return res.status(401).json({ message: 'Unauthorized' });

            const id = Number(req.params.id);
            if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

            if (caller.role !== 'admin' && caller.id !== id)
                return res.status(403).json({ message: 'Forbidden' });

            const user = await usersService.findById(id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            return res.json(await usersService.sanitize(user));
        } catch (err) {
            console.error('UsersController.getById error', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async block(req: AuthRequest, res: Response) {
        try {
            const caller = req.user;
            if (!caller) return res.status(401).json({ message: 'Unauthorized' });

            const id = Number(req.params.id);
            if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

            if (caller.role !== 'admin' && caller.id !== id)
                return res.status(403).json({ message: 'Forbidden' });

            const status = typeof req.body.isActive === 'boolean'
                ? req.body.isActive
                : false;

            const updated = await usersService.blockUser(id, status);

            if (!updated) return res.status(404).json({ message: 'User not found' });

            return res.json({
                message: status ? 'User unblocked' : 'User blocked',
                user: await usersService.sanitize(updated),
            });
        } catch (err) {
            console.error('UsersController.block error', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
