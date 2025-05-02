import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleCondition as SimpleConditionType } from "@/lib/types/signal.types";
import { Trash } from "lucide-react";
import React from "react";
import {
  getCompatibleOperators,
  getDataSourceById,
  getDataSourcesByCategory,
  getEnumValuesForDataSource,
  getSuggestedValuesForDataSource,
} from "./mock-data";

interface SimpleConditionProps {
  condition: SimpleConditionType;
  onUpdate: (updatedCondition: SimpleConditionType) => void;
  onDelete: () => void;
  disabled?: boolean;
  assetPair?: string;
}

const SimpleConditionComponent: React.FC<SimpleConditionProps> = ({
  condition,
  onUpdate,
  onDelete,
  disabled = false,
  assetPair,
}) => {
  const selectedDataSource = getDataSourceById(condition.dataSource);
  const compatibleOperators = getCompatibleOperators(condition.dataSource);
  const categorizedDataSources = getDataSourcesByCategory();
  const enumValues = getEnumValuesForDataSource(condition.dataSource);
  const suggestedValues = getSuggestedValuesForDataSource(condition.dataSource);

  const handleDataSourceChange = (value: string) => {
    // Reset operator when data source changes
    onUpdate({
      ...condition,
      dataSource: value,
      operator: "",
      value: "",
    });
  };

  const handleOperatorChange = (value: string) => {
    onUpdate({
      ...condition,
      operator: value,
    });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let parsedValue: string | number | boolean = value;

    // Parse value based on data source type
    if (selectedDataSource) {
      if (selectedDataSource.type === "number") {
        parsedValue = value === "" ? "" : parseFloat(value);
      } else if (selectedDataSource.type === "boolean") {
        parsedValue = value === "true";
      }
    }

    onUpdate({
      ...condition,
      value: parsedValue,
    });
  };

  const handleEnumValueChange = (value: string) => {
    onUpdate({
      ...condition,
      value: value,
    });
  };

  const handleSuggestedValueClick = (value: string | number | boolean) => {
    onUpdate({
      ...condition,
      value: value,
    });
  };

  const renderValueInput = () => {
    if (!selectedDataSource || !condition.operator) {
      return (
        <Input
          className="w-[180px] bg-background"
          placeholder="Select an operator"
          disabled={true}
        />
      );
    }

    if (selectedDataSource.type === "boolean") {
      return (
        <Select
          disabled={disabled || !condition.dataSource}
          value={
            typeof condition.value === "boolean"
              ? condition.value.toString()
              : ""
          }
          onValueChange={(value) => {
            onUpdate({
              ...condition,
              value: value === "true",
            });
          }}
        >
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );
    } else if (selectedDataSource.type === "enum" && enumValues.length > 0) {
      return (
        <Select
          disabled={disabled || !condition.dataSource || !condition.operator}
          value={condition.value?.toString() || ""}
          onValueChange={handleEnumValueChange}
        >
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {enumValues.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else {
      return (
        <>
          <Input
            className="w-[180px] bg-background"
            type={selectedDataSource.type === "number" ? "number" : "text"}
            placeholder="Enter value"
            value={condition.value?.toString() || ""}
            onChange={handleValueChange}
            disabled={disabled || !condition.dataSource || !condition.operator}
          />

          {/* Suggested values */}
          {suggestedValues.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {suggestedValues.map((value, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSuggestedValueClick(value)}
                >
                  {value.toString()}
                </Badge>
              ))}
            </div>
          )}
        </>
      );
    }
  };

  // Determine if condition is invalid
  const isInvalid = () => {
    if (!selectedDataSource || !condition.operator) return false;
    if (condition.value === undefined || condition.value === "") return true;
    return false;
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 p-3 rounded-md border ${isInvalid() ? "border-red-500" : "border-border"} bg-background shadow-sm transition-colors`}
    >
      {assetPair && (
        <Badge variant="secondary" className="mb-2">
          {assetPair.toUpperCase().replace("-", "/")}
        </Badge>
      )}

      <Select
        disabled={disabled}
        value={condition.dataSource}
        onValueChange={handleDataSourceChange}
      >
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Select data source" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {Object.entries(categorizedDataSources).map(
            ([category, sources], categoryIndex) => (
              <React.Fragment key={category}>
                {categoryIndex > 0 && <SelectSeparator />}
                <SelectGroup>
                  <SelectLabel className="font-semibold text-sm text-primary">
                    {category}
                  </SelectLabel>
                  {sources.map((dataSource) => (
                    <SelectItem
                      key={dataSource.id}
                      value={dataSource.id}
                      className="pl-6 text-sm"
                    >
                      {dataSource.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </React.Fragment>
            )
          )}
        </SelectContent>
      </Select>

      <Select
        disabled={disabled || !condition.dataSource}
        value={condition.operator}
        onValueChange={handleOperatorChange}
      >
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Select operator" />
        </SelectTrigger>
        <SelectContent>
          {compatibleOperators.map((operator) => (
            <SelectItem key={operator.id} value={operator.id}>
              {operator.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {renderValueInput()}

      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={disabled}
        className="text-gray-500 hover:text-destructive"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SimpleConditionComponent;
