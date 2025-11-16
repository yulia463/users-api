import jwt from 'jsonwebtoken';
import {AuthService} from "../../src/services/auth.service";
import {comparePassword, hashPassword} from "../../src/utils/hash";

jest.mock('../../src/utils/hash', () => ({
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

describe('AuthService', () => {
    let repo: any;
    let service: AuthService;

    beforeEach(() => {
        repo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        service = new AuthService(repo);

        (hashPassword as jest.Mock).mockReset();
        (comparePassword as jest.Mock).mockReset();
        (jwt.sign as jest.Mock).mockReset();
    });

    it('successful registration', async () => {
        repo.findOne.mockResolvedValue(null);
        (hashPassword as jest.Mock).mockResolvedValue('hashed');
        repo.create.mockReturnValue({ id: 1 });
        repo.save.mockResolvedValue({
            id: 1,
            fullName: 'Test User',
            email: 'test@mail.com',
            passwordHash: 'hashed',
            isActive: true,
        });

        const result = await service.register({
            fullName: 'Test User',
            birthDate: '2000-01-01',
            email: 'test@mail.com',
            password: '1234',
        });

        expect(result).toEqual({
            id: 1,
            fullName: 'Test User',
            email: 'test@mail.com',
            isActive: true,
        });
    });

    it('Error: Email already taken', async () => {
        repo.findOne.mockResolvedValue({ id: 1 });

        await expect(
            service.register({
                fullName: 'Test',
                birthDate: '2000-01-01',
                email: 'taken@mail.com',
                password: '1234',
            })
        ).rejects.toThrow('Email already used');
    });

    it('successful login', async () => {
        repo.findOne.mockResolvedValue({
            id: 10,
            email: 'test@mail.com',
            passwordHash: 'hashed',
            role: 'user',
            isActive: true,
        });

        (comparePassword as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue('jwt-token');

        const result = await service.login('test@mail.com', '1234');

        expect(result).toEqual({ token: 'jwt-token' });
    });

    it('error: invalid email', async () => {
        repo.findOne.mockResolvedValue(null);

        await expect(service.login('no@mail.com', '123'))
            .rejects
            .toThrow('Invalid credentials');
    });

    it('Error: Incorrect password', async () => {
        repo.findOne.mockResolvedValue({
            id: 1,
            email: 'x@mail.com',
            passwordHash: 'hashed',
            role: 'user',
            isActive: true,
        });

        (comparePassword as jest.Mock).mockResolvedValue(false);

        await expect(service.login('x@mail.com', 'wrong'))
            .rejects
            .toThrow('Invalid credentials');
    });

    it('error: user blocked', async () => {
        repo.findOne.mockResolvedValue({
            id: 1,
            email: 'x@mail.com',
            passwordHash: 'hashed',
            role: 'user',
            isActive: false,
        });

        (comparePassword as jest.Mock).mockResolvedValue(true);

        await expect(service.login('x@mail.com', '123'))
            .rejects
            .toThrow('User is blocked');
    });
});
