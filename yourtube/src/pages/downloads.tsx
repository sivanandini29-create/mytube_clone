import Downloads from "@/components/Download";
import { useUser } from "@/lib/AuthContext";

export default function DownloadsPage() {
  const { user } = useUser();

  return <Downloads user={user} />;
}