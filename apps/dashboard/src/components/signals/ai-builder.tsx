import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SignalDefinition } from "@/lib/types/signal.types";
import React, { useState } from "react";
import { toast } from "sonner";
// import { processNaturalLanguage } from "@/lib/utils/signal.utils";

interface AISignalBuilderProps {
  signal: SignalDefinition;
  onUpdateSignal: (updatedSignal: SignalDefinition) => void;
}

const AISignalBuilder: React.FC<AISignalBuilderProps> = ({
  signal,
  onUpdateSignal,
}) => {
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);

  const handleApplyAiSuggestion = () => {
    if (!aiPrompt.trim()) {
      toast("Please enter a prompt first");
      return;
    }

    setIsProcessingAi(true);

    // Simulate processing delay
    setTimeout(() => {
      try {
        // const suggestion = processNaturalLanguage(aiPrompt);
        // onUpdateSignal({
        //   ...signal,
        //   name: suggestion.name || signal.name,
        //   description: suggestion.description || signal.description,
        //   rootCondition: suggestion.condition || signal.rootCondition,
        // });
        toast.success("AI suggestion applied!");
      } catch (error) {
        toast.error("Failed to process your request");
        console.error(error);
      } finally {
        setIsProcessingAi(false);
      }
    }, 1000);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="text-lg font-medium">AI Signal Assistant</div>
          <p className="text-sm text-muted-foreground">
            Describe the signal you want to create in natural language, and our
            AI will help you build it.
          </p>
          <div className="flex gap-2">
            <Input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Alert me when BTC price exceeds $100,000 and social media sentiment is positive"
              className="flex-1"
              disabled={isProcessingAi}
            />
            <Button
              onClick={handleApplyAiSuggestion}
              disabled={isProcessingAi || !aiPrompt.trim()}
            >
              {isProcessingAi ? "Processing..." : "Generate"}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground italic">
            Try phrases like &apos;Alert me when BTC price exceeds $100,000 and
            social media sentiment is positive&apos;
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISignalBuilder;
