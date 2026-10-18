import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError, getPage, paged } from "../lib/http";
import { optionalSession } from "../middleware/auth";

export const feedbackRoutes = Router();
export const feedbackAdminRoutes = Router();

const feedbackInput = z.object({
  message: z.string().trim().min(3, "Please write at least a few words of feedback").max(2000, "Feedback must be under 2000 characters"),
  category: z.string().trim().max(50).optional(),
  email: z.string().trim().email("Please enter a valid email address").optional().or(z.literal("")),
  pageUrl: z.string().trim().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Public feedback submission
feedbackRoutes.post("/", optionalSession, async (req, res) => {
  const parsed = feedbackInput.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid feedback submission");
  }

  const { message, category, email, pageUrl, metadata } = parsed.data;
  const userId = req.user?.id ?? null;

  const feedback = await prisma.feedback.create({
    data: {
      message,
      category: category || "GENERAL",
      email: email || null,
      pageUrl: pageUrl ?? null,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      userId,
    },
    select: {
      id: true,
      message: true,
      category: true,
      createdAt: true,
    },
  });

  res.status(201).json({
    ok: true,
    message: "Thank you for sharing your feedback with DocHomoeo!",
    feedback,
  });
});

// Admin listing
feedbackAdminRoutes.get("/", async (req, res) => {
  const { page, pageSize, skip, take } = getPage(req);
  const [total, items] = await Promise.all([
    prisma.feedback.count(),
    prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    }),
  ]);

  res.json(paged(items, total, page, pageSize));
});
