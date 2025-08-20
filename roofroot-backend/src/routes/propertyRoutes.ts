import { Router } from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController';
import { authenticateToken, requireAgency } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Protected routes
router.use(authenticateToken);

// Agency-scoped operations
router.post('/', requireAgency, createProperty);
router.patch('/:id', requireAgency, updateProperty);
router.delete('/:id', requireAgency, deleteProperty);

export default router;
