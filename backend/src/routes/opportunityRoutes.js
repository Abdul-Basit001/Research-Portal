import { Router } from 'express';
import {
	createOpportunity,
	getAllOpportunities,
	getOpportunityById,
	updateOpportunity,
	deleteOpportunity,
} from '../controllers/opportunityController.js';

const router = Router();

router.get('/', getAllOpportunities);
router.post('/', createOpportunity);
router.get("/:id", getOpportunityById);
router.put("/:id", updateOpportunity);
router.delete("/:id", deleteOpportunity);

export default router;