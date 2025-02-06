import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Smile, MessageSquare } from "lucide-react";
import type { PullRequest } from "@shared/schema";

interface PrListProps {
  prs: PullRequest[];
}

export function PrList({ prs }: PrListProps) {
  return (
    <div className="space-y-4">
      {prs.map((pr) => (
        <Card key={pr.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-[#24292E]">{pr.title}</h3>
                <p className="text-sm text-gray-500">
                  #{pr.githubPrId} by {pr.author}
                </p>
                <div className="mt-2 flex gap-2">
                  {pr.labels.map((label) => (
                    <Badge key={label} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
              {pr.analysisResult?.canMerge ? (
                <CheckCircle className="h-6 w-6 text-[#2EA44F]" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="font-medium">Comments</p>
                  <p>{pr.commentCount}</p>
                </div>
                <div>
                  <p className="font-medium">Approvals</p>
                  <p>{pr.analysisResult?.approvals || 0}</p>
                </div>
                <div>
                  <p className="font-medium">Changes Requested</p>
                  <p>{pr.analysisResult?.changes || 0}</p>
                </div>
              </div>

              {/* ML Analysis Section */}
              {pr.analysisResult?.mlAnalysis && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4" />
                    <p className="font-medium">Comment Analysis</p>
                  </div>
                  <div className="space-y-2">
                    <p>
                      Sentiment: {Math.round(pr.analysisResult.mlAnalysis.overallSentiment * 100)}%
                    </p>
                    <div>
                      <p className="font-medium text-xs uppercase text-gray-500 mb-1">
                        Common Topics
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pr.analysisResult.mlAnalysis.topKeywords.map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Emoji Analysis Section */}
              {pr.analysisResult?.emojiAnalysis && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Smile className="h-4 w-4" />
                    <p className="font-medium">Emoji Sentiment</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      Score: {Math.round(pr.analysisResult.emojiAnalysis.score * 100)}%
                    </p>
                    <div className="flex gap-2 mt-1">
                      {pr.analysisResult.emojiAnalysis.topEmojis.map(({ emoji, count }) => (
                        <Badge key={emoji} variant="outline">
                          {emoji} × {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}