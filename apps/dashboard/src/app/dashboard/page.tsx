"use client";

import Home from "@/components/dashboard/home";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDashboardData } from "@/services/queries/home";
// import { getDashboardData } from "@/services/queries/home/actions";
// import { fetchNewsData } from "@/services/queries/news/server-actions";
import React, { Fragment, Suspense } from "react";

export default function Page() {
  const { data: dashboardData } = useGetDashboardData();
  // await fetchNewsData();
  const ald: any = {
    tabs: [
      {
        id: "78a7ef65-be46-40f7-9155-da9528e53e9b",
        name: "Untitled Layout",
        layout_id: "b0528e22-9052-48c1-a6d6-84a80303bab5",
        layouts: {
          id: "b0528e22-9052-48c1-a6d6-84a80303bab5",
          name: "Untitled Layout",
          draft: true,
          widgets: [
            {
              id: "03fbc63c-bf19-4751-8895-c6764cf1b02a",
              meta: {
                h: 2,
                i: "03fbc63c-bf19-4751-8895-c6764cf1b02a@/$token-news",
                w: 1.5,
                x: 4,
                y: 0,
                moved: false,
                static: false,
              },
              props: {
                meta: {
                  h: 2,
                  w: 1.5,
                },
                token: "ETH",
              },
              layout_id: "b0528e22-9052-48c1-a6d6-84a80303bab5",
            },
            {
              id: "246f0fa5-fc0e-452f-9cb0-505761e71940",
              meta: {
                h: 2,
                i: "246f0fa5-fc0e-452f-9cb0-505761e71940@/$detailed-cfgi",
                w: 3,
                x: 0,
                y: 0,
                moved: false,
                static: false,
              },
              props: {
                meta: {
                  h: 2,
                  w: 3,
                },
                token: "BTC",
                period: 4,
                sentiment_tab: "both",
                exchange_token: "Binance BTC/USDT",
              },
              layout_id: "b0528e22-9052-48c1-a6d6-84a80303bab5",
            },
            {
              id: "b624bc3a-7e9a-4d5e-8706-b6da4f130d0d",
              meta: {
                h: 2,
                i: "b624bc3a-7e9a-4d5e-8706-b6da4f130d0d@/$simple-cfgi",
                w: 3,
                x: 3,
                y: 2,
                moved: false,
                static: false,
              },
              props: {
                meta: {
                  h: 2,
                  w: 3,
                },
                token: "BTC",
                period: 4,
              },
              layout_id: "b0528e22-9052-48c1-a6d6-84a80303bab5",
            },
          ],
        },
      },
    ],
    layouts: [
      {
        id: "1faa50d6-54e2-418c-a377-e66e1b7e40d1",
        name: "Untitled Layout",
        draft: false,
        widgets: [
          {
            id: "fdb9b31d-06b9-4817-9c4c-6a1598beb466",
            meta: {
              h: 2,
              i: "fdb9b31d-06b9-4817-9c4c-6a1598beb466@/$detailed-cfgi",
              w: 3,
              x: 0,
              y: 2,
              moved: false,
              static: false,
            },
            props: {
              token: "ETH",
              period: 3,
              sentiment_tab: "both",
              exchange_token: "Binance BTC/USDT",
            },
            token: null,
            layout_id: "1faa50d6-54e2-418c-a377-e66e1b7e40d1",
          },
          {
            id: "9b19968e-deca-47eb-af31-883f5651cb7c",
            meta: {
              h: 2,
              i: "9b19968e-deca-47eb-af31-883f5651cb7c@/$simple-cfgi",
              w: 3,
              x: 3,
              y: 0,
            },
            props: {
              meta: {
                h: 2,
                w: 3,
              },
              token: "BTC",
              period: 4,
            },
            token: null,
            layout_id: "1faa50d6-54e2-418c-a377-e66e1b7e40d1",
          },
          {
            id: "32052dea-ef99-41fb-aecd-d29276dbb333",
            meta: {
              h: 2,
              i: "32052dea-ef99-41fb-aecd-d29276dbb333@/$liquidation-map",
              w: 3,
              x: 0,
              y: 2,
            },
            props: {
              meta: {
                h: 2,
                w: 3,
              },
              token: "BTC",
              period: "1d",
              exchange_token: "Binance BTC/USDT",
            },
            token: null,
            layout_id: "1faa50d6-54e2-418c-a377-e66e1b7e40d1",
          },
          {
            id: "d3a6a17e-fa96-481f-aaa3-1606fa0ec20d",
            meta: {
              h: 2,
              i: "d3a6a17e-fa96-481f-aaa3-1606fa0ec20d@/$liquidation-heat-map",
              w: 3,
              x: 3,
              y: 2,
            },
            props: {
              meta: {
                h: 2,
                w: 3,
              },
              token: "BTC",
              period: "12h",
              exchange_token: "Binance BTC/USDT",
            },
            token: null,
            layout_id: "1faa50d6-54e2-418c-a377-e66e1b7e40d1",
          },
          {
            id: "c9cdcbfd-d92b-4405-b5ec-a544e7c6b806",
            meta: {
              h: 2,
              i: "c9cdcbfd-d92b-4405-b5ec-a544e7c6b806@/$exchange-liquidation-map",
              w: 3,
              x: 0,
              y: 4,
            },
            props: {
              meta: {
                h: 2,
                w: 3,
              },
              token: "BTC",
              period: "1d",
            },
            token: null,
            layout_id: "1faa50d6-54e2-418c-a377-e66e1b7e40d1",
          },
        ],
      },
      {
        id: "b0528e22-9052-48c1-a6d6-84a80303bab5",
        name: "Untitled Layout",
        draft: true,
        widgets: [
          {
            id: "03fbc63c-bf19-4751-8895-c6764cf1b02a",
            meta: {
              h: 2,
              i: "03fbc63c-bf19-4751-8895-c6764cf1b02a@/$token-news",
              w: 1.5,
              x: 4,
              y: 0,
              moved: false,
              static: false,
            },
            props: {
              meta: {
                h: 2,
                w: 1.5,
              },
              token: "ETH",
            },
            token: null,
            layout_id: "b0528e22-9052-48c1-a6d6-84a80303bab5",
          },
          {
            id: "246f0fa5-fc0e-452f-9cb0-505761e71940",
            meta: {
              h: 2,
              i: "246f0fa5-fc0e-452f-9cb0-505761e71940@/$detailed-cfgi",
              w: 3,
              x: 0,
              y: 0,
              moved: false,
              static: false,
            },
            props: {
              meta: {
                h: 2,
                w: 3,
              },
              token: "BTC",
              period: 4,
              sentiment_tab: "both",
              exchange_token: "Binance BTC/USDT",
            },
            token: null,
            layout_id: "b0528e22-9052-48c1-a6d6-84a80303bab5",
          },
          {
            id: "b624bc3a-7e9a-4d5e-8706-b6da4f130d0d",
            meta: {
              h: 2,
              i: "b624bc3a-7e9a-4d5e-8706-b6da4f130d0d@/$simple-cfgi",
              w: 3,
              x: 3,
              y: 2,
              moved: false,
              static: false,
            },
            props: {
              meta: {
                h: 2,
                w: 3,
              },
              token: "BTC",
              period: 4,
            },
            token: null,
            layout_id: "b0528e22-9052-48c1-a6d6-84a80303bab5",
          },
        ],
      },
      {
        id: "a95b406c-30ab-43d3-87ee-327dbc05d0ba",
        name: "Untitled Layout",
        draft: true,
        widgets: [
          {
            id: "d1484032-8748-4bd1-8c9c-e946af7cbdd1",
            meta: {
              h: 2,
              i: "d1484032-8748-4bd1-8c9c-e946af7cbdd1@/$detailed-cfgi",
              w: 3,
              x: 0,
              y: 0,
            },
            props: {
              token: "BTC",
              period: 4,
              sentiment_tab: "both",
              exchange_token: "Binance BTC/USDT",
            },
            token: null,
            layout_id: "a95b406c-30ab-43d3-87ee-327dbc05d0ba",
          },
        ],
      },
    ],
    settings: {
      id: "a78c917b-0b20-47c3-91b0-793971389f65",
      user_id: "6c3601d3-4a4e-4fd8-81ac-016b461a4f11",
      auto_save: true,
    },
  };
  return (
    <Fragment>
      {dashboardData ? (
        <Home dashboardData={dashboardData} />
      ) : (
        <Skeleton className="w-full h-full bg-widget-background-200" />
      )}
    </Fragment>
  );
}
