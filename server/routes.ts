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
    
    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const octokit = new Octokit({ auth: accessToken });
    
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
  });

  const httpServer = createServer(app);
  return httpServer;
}
