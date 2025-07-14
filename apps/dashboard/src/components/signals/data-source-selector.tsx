// import { signalDataSources } from "@/constant/signals/data-source-config";
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
import { useDataSources } from "@/hooks/smart-signals/use-data-sources";

type DataSourceDropDownProps = {
  onDataSourcePrefixChange: (prefix: string) => void;
  value?: string | null;
};

const SignalDataSourceSelector = (props: DataSourceDropDownProps) => {
  const { dataSourcesByGroups } = useDataSources();

  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">Data source</Label>

      <Select
        disabled={false}
        value={props.value || undefined}
        onValueChange={props.onDataSourcePrefixChange}
      >
        <SelectTrigger className="w-full bg-background !h-12">
          <SelectValue placeholder="Select data source" />
        </SelectTrigger>

        <SelectContent className="overflow-y-auto bg-[#080808]">
          {Object.entries(dataSourcesByGroups).map(([group, sources]) => (
            <SelectGroup key={group}>
              <SelectLabel className="font-semibold text-sm text-fomoed-red">
                {group}
              </SelectLabel>

              {sources.map((dataSource) => (
                <SelectItem
                  key={dataSource.prefix}
                  value={dataSource.prefix}
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
