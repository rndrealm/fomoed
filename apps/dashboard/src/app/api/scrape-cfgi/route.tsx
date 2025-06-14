import { CfgiDataResponse, CFGIEnum } from "@/services/queries/charts/types";
import { NextResponse } from "next/server";
import { sortBy } from "lodash-es";
import { createSupabaseServerWithAnonKey } from "@/lib/utils/supabase/server-client";

/**
 * Organizes token data for Supabase database rows
 * @param data Array of token objects with date fields
 * @returns Array of objects with token, yesterday, and today fields
 */
function organizeTokenData(data: any[]) {
  // Group the data by token
  const groupedByToken = data.reduce((acc, item) => {
    if (!acc[item.token]) {
      acc[item.token] = [];
    }
    acc[item.token].push(item);
    return acc;
  }, {});

  // For each token, create a row with yesterday and today data
  return Object.entries(groupedByToken).map(([token, items]) => {
    // Cast items to array and sort by date (ascending)
    const sortedItems = [...(items as any[])].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return {
      token,
      yesterday: sortedItems[0] || null,
      today: sortedItems[1] || null,
    };
  });
}

//! REQUEST HANDLER FOR /api/scrape-cfgi
export async function GET(request: Request) {
  try {
    // API key is safely stored on server
    const apiKey = process.env.CFGI_API_KEY;

    const token =
      "BTC,ETH,BNB,XRP,SOL,ADA,LUNA,AVAX,DOGE,DOT,SHIB,TRX,XLM,LINK,UNI,FTM,ALGO,MANA,LTC,NEAR,BCH,ETC,ATOM,VET,HBAR,FLOW,ICP,APE,EGLD,XTZ,THETA,FIL,AXS,SAND,ZEC,EOS,IOTA,PEPE,ARB,INJ,GRT,WIF,SUI,BONK,NOT,AAVE,JUP,SEI,GALA,BTT,TON,NEIRO,FET,EIGEN,OG,KAS,FLOKI,RUNE,TRUMP";

    const values = "1";
    const period = "4";

    const response = await fetch(
      `https://cfgi.io/api/api_request.php?api_key=${apiKey}&token=${token}&period=${period}&values=${values}`
      // {
      //   cache: "no-store",
      // }
    );
    const resText = await response.text();

    const data = JSON.parse(resText) as CfgiDataResponse[];

    // Organize the data
    const organizedData = organizeTokenData(data);

    const supabase = await createSupabaseServerWithAnonKey();

    const upsertQuery = await supabase
      .from("cfgi_data")
      .upsert(organizedData, { onConflict: "token" });

    if (upsertQuery.error) {
      console.error("Error inserting data:", upsertQuery.error);
      throw new Error(upsertQuery.error.message);
    }

    return NextResponse.json({ data: organizedData });
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching CFGI data:", error);
    return NextResponse.json(
      { error: "Failed to fetch CFGI data" },
      { status: 500 }
    );
  }
}
