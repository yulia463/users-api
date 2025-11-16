import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { AppDataSource } from '../config/datasource';
import { User } from '../entities/User';
import dotenv from 'dotenv';
dotenv.config();

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET as string,
}, async (payload, done) => {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: payload.sub } });
        if (!user) return done(null, false);
        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
}));

export const authenticateJwt = passport.authenticate('jwt', { session: false });

export function requireRole(role: 'admin' | 'user') {
    return (req: any, res: any, next: any) => {
        const user: User = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        if (user.role !== role) return res.status(403).json({ message: 'Forbidden' });
        next();
    };
}
