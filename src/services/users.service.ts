import { Repository } from 'typeorm';
import { User } from '../entities/User';

export class UsersService {
    constructor(private readonly userRepo: Repository<User>) {}

    async findAll(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [items, total] = await this.userRepo.findAndCount({
            skip,
            take: limit,
            order: { id: 'ASC' },
        });

        return { items, total };
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepo.findOne({ where: { id } });
    }

    async blockUser(id: number, status: boolean): Promise<User | null> {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) return null;

        user.isActive = status;
        return await this.userRepo.save(user);
    }

    async sanitize(user: User): Promise<Omit<User, 'passwordHash'>> {
        const { passwordHash, ...safe } = user as any;
        return safe;
    }
}
