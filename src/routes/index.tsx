import { createFileRoute } from "@tanstack/react-router";
import { WatchStage } from "@/components/WatchStage";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <WatchStage />;
}
