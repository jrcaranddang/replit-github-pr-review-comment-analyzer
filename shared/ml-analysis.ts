import * as tf from '@tensorflow/tfjs-node';
import natural from 'natural';
import Sentiment from 'sentiment';
import { analyzeEmojis } from './emoji-analysis';

const tokenizer = new natural.WordTokenizer();
const sentiment = new Sentiment();

// Predefined categories for comment classification
export const COMMENT_CATEGORIES = {
  APPROVAL: 'approval',
  SUGGESTION: 'suggestion',
  QUESTION: 'question',
  CONCERN: 'concern',
  PRAISE: 'praise',
} as const;

export type CommentCategory = typeof COMMENT_CATEGORIES[keyof typeof COMMENT_CATEGORIES];

export interface MLAnalysis {
  sentiment: number;
  category: CommentCategory;
  confidence: number;
  keywords: string[];
}

// Text preprocessing
function preprocessText(text: string): string[] {
  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  return tokens.filter(token => token.length > 2);
}

// Basic keyword-based classification
function classifyComment(text: string): { category: CommentCategory; confidence: number } {
  const keywords = {
    [COMMENT_CATEGORIES.APPROVAL]: ['lgtm', 'approve', 'approved', 'yes', 'good', 'merge'],
    [COMMENT_CATEGORIES.SUGGESTION]: ['maybe', 'suggest', 'could', 'what if', 'consider'],
    [COMMENT_CATEGORIES.QUESTION]: ['why', 'how', 'what', 'when', '?'],
    [COMMENT_CATEGORIES.CONCERN]: ['issue', 'problem', 'bug', 'error', 'wrong'],
    [COMMENT_CATEGORIES.PRAISE]: ['great', 'excellent', 'awesome', 'nice', 'well done'],
  };

  const tokens = preprocessText(text);
  const scores = Object.entries(keywords).map(([category, categoryKeywords]) => {
    const matches = tokens.filter(token => 
      categoryKeywords.some(keyword => token.includes(keyword))
    ).length;
    return { category, score: matches / tokens.length };
  });

  const bestMatch = scores.reduce((best, current) => 
    current.score > best.score ? current : best
  );

  return {
    category: bestMatch.category as CommentCategory,
    confidence: bestMatch.score,
  };
}

// Combine ML analysis with sentiment analysis
export async function analyzeComment(text: string): Promise<MLAnalysis> {
  // Get sentiment score
  const sentimentResult = sentiment.analyze(text);
  const normalizedSentiment = sentimentResult.score / Math.max(sentimentResult.tokens.length, 1);

  // Get classification
  const classification = classifyComment(text);

  // Extract important keywords (words with high sentiment scores)
  const keywords = sentimentResult.tokens
    .filter(token => Math.abs(sentimentResult.score) > 0)
    .slice(0, 5);

  return {
    sentiment: Math.max(-1, Math.min(1, normalizedSentiment)), // Normalize to [-1, 1]
    category: classification.category,
    confidence: classification.confidence,
    keywords,
  };
}

// Analyze multiple comments and aggregate results
export async function analyzeComments(comments: string[]): Promise<{
  overallSentiment: number;
  categoryDistribution: Record<CommentCategory, number>;
  topKeywords: string[];
  emojiAnalysis: ReturnType<typeof analyzeEmojis>;
}> {
  const analyses = await Promise.all(comments.map(analyzeComment));
  const emojiAnalysis = analyzeEmojis(comments.join('\n'));

  // Calculate overall sentiment
  const overallSentiment = analyses.reduce((sum, analysis) => 
    sum + analysis.sentiment, 0) / analyses.length;

  // Calculate category distribution
  const categoryDistribution = analyses.reduce((dist, analysis) => {
    dist[analysis.category] = (dist[analysis.category] || 0) + 1;
    return dist;
  }, {} as Record<CommentCategory, number>);

  // Aggregate keywords
  const allKeywords = analyses.flatMap(a => a.keywords);
  const keywordCounts = allKeywords.reduce((counts, keyword) => {
    counts[keyword] = (counts[keyword] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const topKeywords = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([keyword]) => keyword);

  return {
    overallSentiment,
    categoryDistribution,
    topKeywords,
    emojiAnalysis,
  };
}
