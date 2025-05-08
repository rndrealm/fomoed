import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
// import { generateSignalSummary } from "../../utils/aiUtils";

interface SignalDetailsProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

const SignalDetails = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: SignalDetailsProps) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onDescriptionChange(e.target.value);
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
            <Button variant="ghost" size="sm" onClick={handleGenerateSummary}>
              Generate Summary
            </Button>
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
};

export default SignalDetails;
