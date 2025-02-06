import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  githubId: text("github_id").notNull().unique(),
  username: text("username").notNull(),
  accessToken: text("access_token").notNull(),
});

export const pullRequests = pgTable("pull_requests", {
  id: serial("id").primaryKey(),
  githubPrId: integer("github_pr_id").notNull(),
  repository: text("repository").notNull(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  labels: text("labels").array().notNull(),
  commentCount: integer("comment_count").notNull(),
  analysisResult: jsonb("analysis_result").$type<{
    sentiment: number;
    approvals: number;
    changes: number;
    canMerge: boolean;
    emojiAnalysis?: {
      score: number;
      emojiCount: number;
      topEmojis: Array<{ emoji: string; count: number }>;
    };
    mlAnalysis?: {
      overallSentiment: number;
      categoryDistribution: Record<string, number>;
      topKeywords: string[];
    };
  }>(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertPullRequestSchema = createInsertSchema(pullRequests).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PullRequest = typeof pullRequests.$inferSelect;
export type InsertPullRequest = z.infer<typeof insertPullRequestSchema>;