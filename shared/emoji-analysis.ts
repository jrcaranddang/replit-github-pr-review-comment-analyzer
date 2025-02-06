// Map of emojis to sentiment scores
const emojiSentiments = {
  // Positive reactions
  "👍": 1,
  "❤️": 1,
  "🎉": 1,
  "🚀": 1,
  "💯": 1,
  "✨": 0.5,
  "🌟": 0.5,
  // Approval emojis
  "✅": 1,
  "☑️": 0.5,
  "👏": 0.5,
  // Negative reactions
  "👎": -1,
  "😕": -0.5,
  "❌": -1,
  "🤔": -0.3,
  "😬": -0.5,
  // Neutral/suggestion emojis
  "💭": 0,
  "💡": 0.2,
  "🤓": 0.1,
};

export interface EmojiAnalysis {
  score: number;
  emojiCount: number;
  topEmojis: Array<{ emoji: string; count: number }>;
}

export function analyzeEmojis(text: string): EmojiAnalysis {
  let score = 0;
  const emojiCounts = new Map<string, number>();
  
  // Match emoji characters
  const emojiRegex = /[\p{Emoji}]/gu;
  const emojis = text.match(emojiRegex) || [];
  
  emojis.forEach(emoji => {
    if (emoji in emojiSentiments) {
      score += emojiSentiments[emoji as keyof typeof emojiSentiments];
      emojiCounts.set(emoji, (emojiCounts.get(emoji) || 0) + 1);
    }
  });

  // Get top 3 most used emojis
  const topEmojis = Array.from(emojiCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emoji, count]) => ({ emoji, count }));

  return {
    score: score / Math.max(emojis.length, 1), // Normalize score by emoji count
    emojiCount: emojis.length,
    topEmojis,
  };
}
