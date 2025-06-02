import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useCallback, useMemo } from "react";
import { Button } from "../ui/button";
import { useGenerateSignalDetails } from "@/services/queries/signals";
import { LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SignalDetailsProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  jsonLogic: Record<string, any> | null;
}

const SignalDetails = React.memo(({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  jsonLogic,
}: SignalDetailsProps) => {
  const { mutate: generateDetails, isPending } = useGenerateSignalDetails();

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value);
  }, [onNameChange]);

  const handleDescriptionChange = useCallback((
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onDescriptionChange(e.target.value);
  }, [onDescriptionChange]);

  const handleGenerateSummary = useCallback(() => {
    if (!jsonLogic) {
      toast.error("Please build a signal condition first");
      return;
    }

    generateDetails(jsonLogic, {
      onSuccess: (response) => {
        if (response.success) {
          onNameChange(response.signal.name);
          onDescriptionChange(response.signal.description);
        } else {
          toast.error(response.message || "Failed to generate details");
        }
      },
      onError: (error) => {
        console.error("Error generating details:", error);
        toast.error("Failed to generate signal details");
      },
    });
  }, [jsonLogic, generateDetails, onNameChange, onDescriptionChange]);

  const isGenerateDisabled = useMemo(() => {
    return isPending || !jsonLogic;
  }, [isPending, jsonLogic]);

  return (
    <Card className="bg-[#0B0B0B]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Signal Details
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
            onClick={handleGenerateSummary}
            disabled={isGenerateDisabled}
          >
            {isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
            ) : <Sparkles className="h-4 w-4 mr-2" />}
            Generate Summary
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label
            htmlFor="signal-name"
            className="block text-sm font-medium mb-1"
          >
            Signal Name
          </label>
          <Input
            id="signal-name"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter a name for your signal"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="signal-description"
              className="block text-sm font-medium"
            >
              Description
            </label>
          </div>
          <Textarea
            id="signal-description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter a description for your signal"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
});

SignalDetails.displayName = 'SignalDetails';

export default SignalDetails;
