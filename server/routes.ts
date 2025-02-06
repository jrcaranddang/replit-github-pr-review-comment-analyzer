import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Octokit } from "@octokit/rest";
import { insertUserSchema, insertPullRequestSchema } from "@shared/schema";
import { analyzeEmojis } from "../shared/emoji-analysis";
import { analyzeComments } from "../shared/ml-analysis"; // Assuming this function exists

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

    // In demo mode, return mock data with emoji analysis and ML analysis
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
            emojiAnalysis: {
              score: 0.75,
              emojiCount: 4,
              topEmojis: [
                { emoji: "👍", count: 2 },
                { emoji: "🎉", count: 1 },
                { emoji: "✨", count: 1 }
              ]
            },
            mlAnalysis: {
              overallSentiment: 0.85,
              categoryDistribution: {
                approval: 2,
                praise: 2,
                suggestion: 1
              },
              topKeywords: ["great", "implementation", "feature", "clean", "approved"]
            }
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
            emojiAnalysis: {
              score: -0.25,
              emojiCount: 3,
              topEmojis: [
                { emoji: "🤔", count: 2 },
                { emoji: "👎", count: 1 }
              ]
            },
            mlAnalysis: {
              overallSentiment: -0.2,
              categoryDistribution: {
                concern: 2,
                question: 1
              },
              topKeywords: ["issue", "problem", "review", "needs", "work"]
            }
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
          // Fetch both reviews and comments
          const [reviews, comments] = await Promise.all([
            octokit.pulls.listReviews({
              owner,
              repo,
              pull_number: pull.number,
            }),
            octokit.pulls.listComments({
              owner,
              repo,
              pull_number: pull.number,
            }),
          ]);

          // Combine all comment texts for emoji analysis and ML analysis
          const allComments = [
            ...reviews.data.map(r => r.body || ""),
            ...comments.data.map(c => c.body || "")
          ];

          const [emojiAnalysis, mlAnalysis] = await Promise.all([
            analyzeEmojis(allComments.join("\n")),
            analyzeComments(allComments.join("\n")) //Added join here
          ]);

          const prData = {
            githubPrId: pull.number,
            repository: `${owner}/${repo}`,
            title: pull.title,
            author: pull.user?.login || "unknown",
            labels: pull.labels.map(l => l.name || ""),
            commentCount: comments.data.length + reviews.data.length,
            analysisResult: {
              sentiment: Math.min(Math.max(mlAnalysis.overallSentiment, -1), 1),
              approvals: reviews.data.filter(c => c.state === "APPROVED").length,
              changes: reviews.data.filter(c => c.state === "CHANGES_REQUESTED").length,
              canMerge: reviews.data.some(c => c.state === "APPROVED"),
              emojiAnalysis,
              mlAnalysis: {
                overallSentiment: mlAnalysis.overallSentiment,
                categoryDistribution: mlAnalysis.categoryDistribution,
                topKeywords: mlAnalysis.topKeywords
              }
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