import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { PullRequest } from "@shared/schema";

interface AnalysisChartProps {
  prs: PullRequest[];
}

export function AnalysisChart({ prs }: AnalysisChartProps) {
  const data = prs.map(pr => ({
    name: `#${pr.githubPrId}`,
    approvals: pr.analysisResult?.approvals ?? 0,
    changes: pr.analysisResult?.changes ?? 0,
    sentiment: pr.analysisResult?.sentiment ?? 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#24292E]">Review Analysis</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="approvals" fill="#2EA44F" name="Approvals" />
            <Bar dataKey="changes" fill="#E34C26" name="Changes Requested" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}