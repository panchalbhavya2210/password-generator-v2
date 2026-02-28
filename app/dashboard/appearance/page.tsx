import { cookies } from "next/headers";
import { setMode, setTheme, setRadius } from "@/app/actions/set-theme";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// All themes including yours
const colorThemes = [
  { id: "blue", label: "Blue", colors: ["#3B82F6", "#1E3A8A", "#93C5FD"] },
  {
    id: "terminal",
    label: "Terminal",
    colors: ["#00FF9C", "#000000", "#003B2E"],
  },

  {
    id: "natural-n",
    label: "Natural",
    colors: ["#4D7C0F", "#365314", "#A3E635"],
  },
  {
    id: "solar-ember",
    label: "Solar Ember",
    colors: ["#F59E0B", "#6D28D9", "#FCD34D"],
  },
  {
    id: "glacier-mint",
    label: "Glacier Mint",
    colors: ["#2DD4BF", "#0F766E", "#99F6E4"],
  },
  {
    id: "crimson-noir",
    label: "Crimson Noir",
    colors: ["#DC2626", "#450A0A", "#FCA5A5"],
  },
  {
    id: "midnight-plum",
    label: "Midnight Plum",
    colors: ["#7C3AED", "#2E1065", "#C4B5FD"],
  },
  {
    id: "aurora-teal",
    label: "Aurora Teal",
    colors: ["#14B8A6", "#0F766E", "#99F6E4"],
  },
  {
    id: "sandstone-olive",
    label: "Sandstone Olive",
    colors: ["#65A30D", "#3F6212", "#BEF264"],
  },
  {
    id: "ultra-contrast",
    label: "Ultra Contrast",
    colors: ["#EF4444", "#000000", "#FFFFFF"],
  },
];

const modes = [
  { id: "light", label: "Light Mode" },
  { id: "dark", label: "Dark Mode" },
];

const radii = [
  { id: "rounded", label: "Rounded" },
  { id: "square", label: "Square" },
];

export default async function AppearancePage() {
  const cookieStore = await cookies();
  const currentTheme = cookieStore.get("theme")?.value || "blue";
  const currentMode = cookieStore.get("mode")?.value || "light";
  const currentRadius = cookieStore.get("theme-radius")?.value || "rounded";

  return (
    <div className="w-full mx-auto space-y-10">
      <h1 className="text-3xl font-semibold">Appearance</h1>
      <p className="text-muted-foreground">
        Customize theme colors and dark mode.
      </p>

      {/* MODE SELECTOR */}
      <section>
        <h2 className="text-xl font-medium mb-4">Display Mode</h2>

        <div className="flex gap-4">
          {modes.map((m, i) => (
            <form
              key={m.id}
              action={async () => {
                "use server";
                await setMode(m.id as "light" | "dark");
              }}
            >
              <button
                type="submit"
                className={cn(
                  "px-4 py-2 rounded-md border transition",
                  currentMode === m.id
                    ? "bg-primary text-white border-primary"
                    : "hover:bg-muted",
                )}
              >
                {m.label}
              </button>
            </form>
          ))}
        </div>
      </section>

      {/* RADIUS SELECTOR */}
      <section>
        <h2 className="text-xl font-medium mb-4">Corner Style</h2>

        <div className="flex gap-4">
          {radii.map((r) => (
            <form
              key={r.id}
              action={async () => {
                "use server";
                await setRadius(r.id as "rounded" | "square");
              }}
            >
              <button
                type="submit"
                className={cn(
                  "px-4 py-2 border transition",
                  r.id === "rounded" ? "rounded-lg" : "rounded-none",
                  currentRadius === r.id
                    ? "bg-primary text-white border-primary"
                    : "hover:bg-muted",
                )}
              >
                {r.label}
              </button>
            </form>
          ))}
        </div>
      </section>
      {/* THEME SELECTOR */}
      <section>
        <h2 className="text-xl font-medium mb-4">Color Themes</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {colorThemes.map((t, i) => (
            <form
              key={i}
              action={async () => {
                "use server";
                await setTheme(t.id);
              }}
            >
              <Card
                className={cn(
                  "cursor-pointer transition rounded-xl p-4 border hover:shadow-lg",
                  currentTheme === t.id && "ring-2 ring-primary border-primary",
                )}
              >
                <button type="submit" className="w-full text-left">
                  <div className="font-medium text-lg mb-3">{t.label}</div>

                  {/* Swatches */}
                  <div className="flex gap-2 mb-4">
                    {t.colors.map((c) => (
                      <div
                        key={c.toString()}
                        className="h-7 w-7 rounded-md border shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  {/* Preview */}
                  <div className="rounded-lg overflow-hidden border shadow-sm bg-white dark:bg-neutral-900">
                    <div
                      className="p-3 text-white text-sm"
                      style={{ backgroundColor: t.colors[0] }}
                    >
                      Header Preview
                    </div>

                    <div
                      className={`p-4 space-y-2 ${
                        currentMode === "dark" ? "bg-gray-950" : "bg-white"
                      }`}
                    >
                      <div className="h-3 w-24 rounded bg-gray-300 dark:bg-neutral-700" />
                      <div className="h-3 w-16 rounded bg-gray-200 dark:bg-neutral-800" />
                    </div>
                  </div>
                </button>
              </Card>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
