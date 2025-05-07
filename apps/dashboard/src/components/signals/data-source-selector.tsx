import { signalDataSources } from "@/constant/signals/data-source-config";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type DataSourceDropDownProps = {
  onChange: (value: string) => void;
  value?: string | null;
};

const SignalDataSourceSelector = (props: DataSourceDropDownProps) => {
  return (
    <Select
      disabled={false}
      value={props.value || undefined}
      onValueChange={props.onChange}
    >
      <SelectTrigger className="w-[180px] bg-background">
        <SelectValue placeholder="Select data source" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto">
        {signalDataSources.map((source) => (
          <SelectGroup key={source.group}>
            <SelectLabel className="font-semibold text-sm text-primary">
              {source.group}
            </SelectLabel>
            {source.dataSources.map((dataSource) => (
              <SelectItem
                key={dataSource.id}
                value={dataSource.id}
                className="pl-6 text-sm"
              >
                {dataSource.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SignalDataSourceSelector;
