import { fetchSignatures } from "@/lib/supabase/server";
import { WallOfFame } from "@/components/wall/WallOfFame";

export const dynamic = "force-dynamic";

export default async function Home() {
  const signatures = await fetchSignatures();

  return <WallOfFame initialSignatures={signatures} />;
}
