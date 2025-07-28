// DEPRECATED
// This component is deprecated and will be removed in the future.

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetAISignal } from "@/services/queries/signals";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import ManualSignalBuilder from "./manual-signal-builder";

interface AISignalBuilderProps {
  logic: object | null;
  onUpdateLogic: (updatedLogic: object | null) => void;
  onUpdateBasicDetails: (name: string, description: string) => void;
}

const aiBuilderFormSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

const AISignalBuilder: React.FC<AISignalBuilderProps> = ({
  logic,
  onUpdateLogic,
  onUpdateBasicDetails,
}) => {
  const { mutateAsync: getAiSignal, isPending } = useGetAISignal();
  const [condition, setCondition] = useState<object | null>();

  const form = useForm<z.infer<typeof aiBuilderFormSchema>>({
    resolver: zodResolver(aiBuilderFormSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const prompt = form.watch("prompt");

  const onSubmit = async (values: z.infer<typeof aiBuilderFormSchema>) => {
    const res = await getAiSignal(values.prompt);
    console.log(res);

    if (res.success && res.signal) {
      onUpdateLogic(res.signal.condition);
      setCondition(res.signal.condition);
      onUpdateBasicDetails(res.signal.name, res.signal.description);
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Card className="mb-6 bg-[#0A0A0A]">
      <CardContent className="pt-2">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-2 w-full">
            <Form {...form}>
              <form
                className="w-full flex items-end gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <div className="flex gap-2 items-end">
                          <Input
                            className="w-full"
                            placeholder="Alert me when BTC price exceeds $100,000 and social media sentiment is positive"
                            {...field}
                          />

                          <Button
                            type="submit"
                            disabled={isPending || !prompt.trim()}
                          >
                            {isPending ? "Processing..." : "Generate"}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          {/* <div className="text-xs text-muted-foreground italic">
            Try phrases like &apos;Alert me when BTC price exceeds $100,000 and
            social media sentiment is positive&apos;
          </div> */}
        </div>

        {/* {condition && (
          <ManualSignalBuilder
            initialLogic={condition}
            setLogic={setCondition}
          />
        )} */}
      </CardContent>
    </Card>
  );
};

export default AISignalBuilder;
