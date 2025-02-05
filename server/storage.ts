import { User, InsertUser, PullRequest, InsertPullRequest } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getPullRequests(repository: string): Promise<PullRequest[]>;
  createPullRequest(pr: InsertPullRequest): Promise<PullRequest>;
  updatePullRequestAnalysis(id: number, analysis: PullRequest["analysisResult"]): Promise<PullRequest>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pullRequests: Map<number, PullRequest>;
  private currentUserId: number;
  private currentPrId: number;

  constructor() {
    this.users = new Map();
    this.pullRequests = new Map();
    this.currentUserId = 1;
    this.currentPrId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.githubId === githubId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPullRequests(repository: string): Promise<PullRequest[]> {
    return Array.from(this.pullRequests.values()).filter(
      (pr) => pr.repository === repository
    );
  }

  async createPullRequest(insertPr: InsertPullRequest): Promise<PullRequest> {
    const id = this.currentPrId++;
    const pr: PullRequest = { ...insertPr, id };
    this.pullRequests.set(id, pr);
    return pr;
  }

  async updatePullRequestAnalysis(
    id: number,
    analysis: PullRequest["analysisResult"]
  ): Promise<PullRequest> {
    const pr = this.pullRequests.get(id);
    if (!pr) throw new Error("PR not found");
    
    const updated = { ...pr, analysisResult: analysis };
    this.pullRequests.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
