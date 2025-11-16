import { UsersService } from '../../src/services/users.service';
import {User} from "../../src/entities/User";

describe('UsersService', () => {
    let service: UsersService;
    let mockRepo: any;

    beforeEach(() => {
        mockRepo = {
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
        };

        service = new UsersService(mockRepo);
    });

    it('should return the user by id', async () => {
        const user = { id: 1, email: 'test@example.com' } as User;

        mockRepo.findOne.mockResolvedValue(user);

        const result = await service.findById(1);

        expect(result).toEqual(user);
        expect(mockRepo.findOne).toHaveBeenCalled();
    });

    it('should block a user if found', async () => {
        const user = { id: 1, isActive: true };

        mockRepo.findOne.mockResolvedValue(user);
        mockRepo.save.mockResolvedValue({ ...user, isActive: false });

        const result = await service.blockUser(1, false);

        expect(result).toEqual({ id: 1, isActive: false });
    });
});
