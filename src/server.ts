import express from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import { AppDataSource } from './config/datasource';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import './middlewares/auth.middleware';

dotenv.config();

const app = express();
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);

const PORT = process.env.PORT || 4000;

AppDataSource.initialize()
    .then(() => {
        console.log('DB connected');
        app.listen(PORT, () => console.log(`Server listening ${PORT}`));
    })
    .catch((err) => {
        console.error('DB connection error', err);
    });
