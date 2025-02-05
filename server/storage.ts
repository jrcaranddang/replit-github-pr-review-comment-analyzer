import { User, InsertUser, PullRequest, InsertPullRequest, users, pullRequests } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getPullRequests(repository: string): Promise<PullRequest[]>;
  createPullRequest(pr: InsertPullRequest): Promise<PullRequest>;
  updatePullRequestAnalysis(id: number, analysis: PullRequest["analysisResult"]): Promise<PullRequest>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.githubId, githubId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPullRequests(repository: string): Promise<PullRequest[]> {
    return db.select().from(pullRequests).where(eq(pullRequests.repository, repository));
  }

  async createPullRequest(insertPr: InsertPullRequest): Promise<PullRequest> {
    const [pr] = await db.insert(pullRequests).values(insertPr).returning();
    return pr;
  }

  async updatePullRequestAnalysis(
    id: number, 
    analysis: PullRequest["analysisResult"]
  ): Promise<PullRequest> {
    const [pr] = await db
      .update(pullRequests)
      .set({ analysisResult: analysis })
      .where(eq(pullRequests.id, id))
      .returning();

    if (!pr) throw new Error("PR not found");
    return pr;
  }
}

export const storage = new DatabaseStorage();