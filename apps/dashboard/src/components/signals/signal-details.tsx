import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SignalDefinition } from "@/lib/types/signal.types";
import React from "react";
// import { generateSignalSummary } from "../../utils/aiUtils";

interface SignalDetailsProps {
  signal: SignalDefinition;
  onUpdateSignal: (updatedSignal: SignalDefinition) => void;
}

const SignalDetails: React.FC<SignalDetailsProps> = ({
  signal,
  onUpdateSignal,
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSignal({ ...signal, name: e.target.value });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onUpdateSignal({ ...signal, description: e.target.value });
  };

  const handleGenerateSummary = () => {
    console.log("TODO");
    // const summary = generateSignalSummary(signal.rootCondition);
    // onUpdateSignal({
    //   ...signal,
    //   description: summary,
    // });
    // toast.success("Summary generated successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signal Details</CardTitle>
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
            value={signal.name}
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
            <Button variant="ghost" size="sm" onClick={handleGenerateSummary}>
              Generate Summary
            </Button>
          </div>
          <Textarea
            id="signal-description"
            value={signal.description}
            onChange={handleDescriptionChange}
            placeholder="Enter a description for your signal"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SignalDetails;
