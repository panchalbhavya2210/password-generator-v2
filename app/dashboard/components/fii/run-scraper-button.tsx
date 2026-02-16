"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
export default function RunScraperButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("idle");

  const checkStatus = async () => {
    const res = await fetch("/api/scraper-status");
    const data = await res.json();

    if (data.status === "queued") setStatus("Queued on GitHub...");
    else if (data.status === "in_progress") setStatus("Scraper running...");
    else if (data.status === "completed") {
      if (data.conclusion === "success") {
        setStatus("Data updated successfully");
      } else {
        setStatus("Scraper failed");
      }
      return true; // stop polling
    }
    return false;
  };

  const run = async () => {
    setLoading(true);
    setStatus("Starting...");

    await fetch("/api/run-scraper", {
      method: "POST",
    });

    // start polling every 15 seconds
    const interval = setInterval(async () => {
      const done = await checkStatus();
      if (done) {
        clearInterval(interval);
        setLoading(false);
      }
    }, 15000);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={run} disabled={loading} variant="outline">
        {loading ? "Processing..." : "Refresh Latest Data"}
      </Button>
    </div>
  );
}
