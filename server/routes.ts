import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Octokit } from "@octokit/rest";
import { insertUserSchema, insertPullRequestSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  app.post("/api/auth/github", async (req, res) => {
    const payload = insertUserSchema.parse(req.body);
    const user = await storage.getUserByGithubId(payload.githubId);

    if (user) {
      return res.json(user);
    }

    const newUser = await storage.createUser(payload);
    res.json(newUser);
  });

  app.get("/api/repos/:owner/:repo/pulls", async (req, res) => {
    const { owner, repo } = req.params;
    const { labels } = req.query;
    const accessToken = req.headers.authorization?.split(" ")[1];

    // In demo mode, return mock data
    if (accessToken === 'demo-token') {
      const mockPRs = [
        {
          githubPrId: 1234,
          repository: `${owner}/${repo}`,
          title: "Add new feature",
          author: "demo-user",
          labels: ["enhancement", "demo"],
          commentCount: 5,
          analysisResult: {
            sentiment: 0.8,
            approvals: 2,
            changes: 1,
            canMerge: true,
          },
        },
        {
          githubPrId: 1235,
          repository: `${owner}/${repo}`,
          title: "Fix bug in login",
          author: "demo-user",
          labels: ["bug", "demo"],
          commentCount: 3,
          analysisResult: {
            sentiment: 0.6,
            approvals: 1,
            changes: 2,
            canMerge: false,
          },
        },
      ];

      const prs = await Promise.all(
        mockPRs.map(prData => 
          storage.createPullRequest(insertPullRequestSchema.parse(prData))
        )
      );

      return res.json(prs);
    }

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const octokit = new Octokit({ auth: accessToken });

    try {
      const pulls = await octokit.pulls.list({
        owner,
        repo,
        state: "open",
        labels: labels as string,
      });

      const prs = await Promise.all(
        pulls.data.map(async (pull) => {
          const { data: comments } = await octokit.pulls.listReviews({
            owner,
            repo,
            pull_number: pull.number,
          });

          const prData = {
            githubPrId: pull.number,
            repository: `${owner}/${repo}`,
            title: pull.title,
            author: pull.user?.login || "unknown",
            labels: pull.labels.map(l => l.name),
            commentCount: comments.length,
            analysisResult: {
              sentiment: Math.random(), // Simplified analysis
              approvals: comments.filter(c => c.state === "APPROVED").length,
              changes: comments.filter(c => c.state === "CHANGES_REQUESTED").length,
              canMerge: comments.some(c => c.state === "APPROVED"),
            },
          };

          return storage.createPullRequest(insertPullRequestSchema.parse(prData));
        })
      );

      res.json(prs);
    } catch (error) {
      console.error('GitHub API Error:', error);
      res.status(500).json({ message: "Failed to fetch pull requests" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}