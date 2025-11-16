import {DeepPartial, Repository} from 'typeorm';
import { User } from '../entities/User';
import { hashPassword, comparePassword } from '../utils/hash';
import jwt from 'jsonwebtoken';

export class AuthService {
    constructor(private readonly repo: Repository<User>) {}

    async register(data: {
        fullName: string;
        birthDate: string | Date;
        email: string;
        password: string;
        role?: string;
    }) {
        const { fullName, birthDate, email, password, role } = data;

        const existing = await this.repo.findOne({ where: { email } });
        if (existing) throw new Error('Email already used');

        const passwordHash = await hashPassword(password);

        const user = this.repo.create({
            fullName,
            birthDate,
            email,
            passwordHash,
            role: role || 'user',
            isActive: true,
        }as DeepPartial<User>);

        const saved = await this.repo.save(user);

        const { passwordHash: _, ...safe } = saved as any;
        return safe;
    }

    async login(email: string, password: string) {
        const user = await this.repo.findOne({ where: { email } });
        if (!user) throw new Error('Invalid credentials');

        const ok = await comparePassword(password, user.passwordHash);
        if (!ok) throw new Error('Invalid credentials');

        if (!user.isActive) throw new Error('User is blocked');

        const token = jwt.sign(
            { sub: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        return { token };
    }
}
