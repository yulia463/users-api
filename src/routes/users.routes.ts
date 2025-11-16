import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { UsersController } from '../controllers/users.controller';
const router = Router();

router.get('/', authenticateJwt, UsersController.list);
router.get('/:id', authenticateJwt, UsersController.getById);
router.patch('/:id/block', authenticateJwt, UsersController.block);

export default router;
