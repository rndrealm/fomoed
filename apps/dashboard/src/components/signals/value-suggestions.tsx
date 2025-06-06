import React from "react";
import { Badge } from "../ui/badge";
import { useValueSuggestions } from "@/services/queries/signals";

type Props = {
  dataSourceId: string | null;
  topic: string | null;
  onSelect?: (value: number) => void;
};

const ValueSuggestions = (props: Props) => {
  const { dataSourceId, topic, onSelect } = props;
  const { data, isLoading } = useValueSuggestions(dataSourceId, topic);

  if (!dataSourceId || !topic || isLoading || !data?.suggestions) return null;

  return (
    <div className="flex items-center gap-3 mt-1">
      {data.suggestions.map((suggestion, index) => (
        <Badge
          key={index}
          variant={"outline"}
          className="text-xs cursor-pointer hover:bg-accent"
          onClick={() => {
            onSelect?.(suggestion.value);
          }}
        >
          {suggestion.label}
        </Badge>
      ))}
    </div>
  );
};

export default ValueSuggestions;
