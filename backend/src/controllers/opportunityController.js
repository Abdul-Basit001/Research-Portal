import { prisma } from '../services/prisma.js';

export const createOpportunity = async (req, res, next) => {
    const { title, description, department, deadline, status } = req.body;

    if (!title || !description || !department) {
        return res.status(400).json({
            message: 'Title, description, and department are required.',
        });
    }

    const parsedDeadline = deadline ? new Date(deadline) : undefined;
    if (parsedDeadline && Number.isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({ message: 'Deadline must be a valid date.' });
    }

    try {
        const opportunity = await prisma.opportunity.create({
            data: {
                title,
                description,
                department,
                deadline: parsedDeadline,
                status,
            },
        });

        res.status(201).json({
            message: 'Research opportunity created successfully.',
            opportunity,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllOpportunities = async (_req, res, next) => {
    try {
        const opportunities = await prisma.opportunity.findMany({
            orderBy: { id: 'asc' },
        });

        res.status(200).json({
            message: 'Research opportunities fetched successfully.',
            opportunities,
        });
    } catch (error) {
        next(error);
    }
};

export const getOpportunityById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const opportunityId = Number(id);
        if (!/^\d+$/.test(id) || !Number.isSafeInteger(opportunityId) || opportunityId < 1) {
            return res.status(400).json({
                message: 'Invalid opportunity ID.',
            });
        }

        const opportunity = await prisma.opportunity.findUnique({
            where: { id: opportunityId },
        });

        if (!opportunity) {
            return res.status(404).json({
                message: 'Research opportunity not found.',
            });
        }

        res.status(200).json({
            message: 'Research opportunity fetched successfully.',
            opportunity,
        });
    } catch (error) {
        next(error);
    }
};


export const updateOpportunity = async (req, res, next) => {
    const { id } = req.params;
    const opportunityId = Number(id);

    if (!/^\d+$/.test(id) || !Number.isSafeInteger(opportunityId) || opportunityId < 1) {
        return res.status(400).json({ message: 'Invalid opportunity ID.' });
    }

    const { title, description, department, deadline, status } = req.body;
    if (!title || !description || !department) {
        return res.status(400).json({
            message: 'Title, description, and department are required.',
        });
    }

    const data = { title, description, department };
    if (deadline !== undefined) {
        if (deadline === null) {
            data.deadline = null;
        } else {
            const parsedDeadline = new Date(deadline);
            if (Number.isNaN(parsedDeadline.getTime())) {
                return res.status(400).json({ message: 'Deadline must be a valid date.' });
            }
            data.deadline = parsedDeadline;
        }
    }
    if (status !== undefined) {
        if (typeof status !== 'string' || !status.trim()) {
            return res.status(400).json({ message: 'Status must be a non-empty string.' });
        }
        data.status = status;
    }

    try {
        const opportunity = await prisma.opportunity.update({
            where: { id: opportunityId },
            data,
        });
        res.status(200).json({
            message: 'Research opportunity updated successfully.',
            opportunity,
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Research opportunity not found.' });
        }
        next(error);
    }
};


export const deleteOpportunity = async (req, res, next) => {
    const opportunityId = Number(req.params.id);

    if (!/^\d+$/.test(req.params.id) || !Number.isSafeInteger(opportunityId) || opportunityId < 1) {
        return res.status(400).json({ message: 'Invalid opportunity ID.' });
    }

    try {
        const opportunity = await prisma.opportunity.delete({
            where: { id: opportunityId },
        });

        res.status(200).json({
            message: 'Research opportunity deleted successfully.',
            opportunity,
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Research opportunity not found.' });
        }
        next(error);
    }
};
