import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
