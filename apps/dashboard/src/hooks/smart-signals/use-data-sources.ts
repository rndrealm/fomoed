import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useMemo } from "react";

/**
 * Example API response:
 * {
    "data_sources": [
        {
            "prefix": "cfgi",
            "data_type": "decimal",
            "name": "Coin Feer & Greed Index",
            "description": "Coin Feer & Greed Index is a sentiment indicator ...",
            "allowed_operators": [
                ">",
                "<"
            ],
            "allowed_topics": null,
            "disabled": false,
            "suggestions_enabled": false,
            "group": "General"
        },
    ]
}
 */

export type DataSourceType =
  | "decimal"
  | "int"
  | "string"
  | "bool"
  | "percentage";

type DataSource = {
  prefix: string;
  data_type: DataSourceType;
  name: string;
  description: string;
  allowed_operators: string[];
  allowed_topics: string[];
  disabled: boolean;
  suggestions_enabled: boolean;
  group: string;
};

const fetchDataSources = async (): Promise<{ data_sources: DataSource[] }> => {
  const response = await axios.get(
    process.env.NEXT_PUBLIC_BACKEND_SMART_SIGNALS_BASE + "/data-sources",
  );
  return response.data;
};

export const useDataSources = () => {
  const query = useQuery({
    queryKey: ["data-sources"],
    queryFn: fetchDataSources,
  });

  const groups = useMemo(() => {
    if (query.data) {
      return Array.from(
        new Set(
          query.data.data_sources.map((source: DataSource) => source.group),
        ),
      );
    }
    return [];
  }, [query.data]);

  const dataSourcesByGroups = useMemo(() => {
    if (query.data) {
      const groupedDataSources: Record<string, DataSource[]> = {};

      for (const source of query.data.data_sources) {
        if (!groupedDataSources[source.group]) {
          groupedDataSources[source.group] = [];
        }

        groupedDataSources[source.group].push(source);
      }

      return groupedDataSources;
    }
    return {};
  }, [query.data]);

  const getDataSourceByPrefix = useCallback(
    (prefix: string): DataSource | undefined => {
      if (query.data) {
        return query.data.data_sources.find(
          (source: DataSource) => source.prefix === prefix,
        );
      }
      return undefined;
    },
    [query.data],
  );

  const getDataSourceTopics = (prefix: string): string[] => {
    const dataSource = getDataSourceByPrefix(prefix);
    if (dataSource) {
      return dataSource.allowed_topics;
    }
    return [];
  };

  const getDataSourceAllowedOperators = useCallback(
    (prefix: string): string[] => {
      const dataSource = getDataSourceByPrefix(prefix);
      if (dataSource) {
        return dataSource.allowed_operators;
      }
      return [];
    },
    [getDataSourceByPrefix],
  );

  const getDataSourceType = useCallback(
    (prefix: string): DataSourceType | null => {
      const dataSource = getDataSourceByPrefix(prefix);
      if (dataSource) {
        return dataSource.data_type;
      }
      return null;
    },
    [getDataSourceByPrefix],
  );

  return {
    query,
    groups,
    dataSourcesByGroups,
    getDataSourceByPrefix,
    getDataSourceTopics,
    getDataSourceAllowedOperators,
    getDataSourceType,
  };
};
