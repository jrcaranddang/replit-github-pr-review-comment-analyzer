import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleLogin = async () => {
    // In a real app, this would redirect to GitHub OAuth
    toast({
      title: "Demo Mode",
      description: "Redirecting to analysis page",
    });
    setLocation("/analyze/facebook/react");
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-[#24292E]">
            GitHub PR Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#24292E] mb-6">
            Analyze pull request comments to determine merge permissions based on team feedback.
          </p>
          <Button 
            onClick={handleLogin}
            className="w-full bg-[#2EA44F] hover:bg-[#2C974B]"
          >
            <GithubIcon className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
