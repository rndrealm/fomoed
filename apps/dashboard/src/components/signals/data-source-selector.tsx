import { signalDataSources } from "@/constant/signals/data-source-config";
import { Label } from "../ui/label";
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
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">Data source</Label>

      <Select
        disabled={false}
        value={props.value || undefined}
        onValueChange={props.onChange}
      >
        <SelectTrigger className="w-full bg-background !h-12">
          <SelectValue placeholder="Select data source" />
        </SelectTrigger>

        <SelectContent className="max-h-[300px] overflow-y-auto bg-[#080808]">
          {signalDataSources.map((source) => (
            <SelectGroup key={source.group}>
              <SelectLabel className="font-semibold text-sm text-fomoed-red">
                {source.group}
              </SelectLabel>

              {source.dataSources.map((dataSource) => (
                <SelectItem
                  key={dataSource.id}
                  value={dataSource.id}
                  className="pl-6 text-sm text-white"
                  disabled={dataSource.disabled}
                >
                  {dataSource.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SignalDataSourceSelector;
