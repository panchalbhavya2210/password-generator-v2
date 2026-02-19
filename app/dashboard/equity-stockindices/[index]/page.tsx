"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EquityStockIndice() {
  const params = useParams();
  const index = decodeURIComponent(params.index as string);

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/equityIndice/${encodeURIComponent(index)}`);
      const json = await res.json();
      setData(json);
    }
    load();
  }, [index]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{index}</h1>
      <pre>{JSON.stringify(data.data?.slice(0, 5), null, 2)}</pre>
    </div>
  );
}
