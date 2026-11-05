import { useEffect, useState } from "react";
import { Sun, X } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Markdown from "./Markdown.jsx";

export default function MorningMotivation() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.morningMotivation) return;
    const today = new Date().toISOString().slice(0, 10);
    const seen = localStorage.getItem("morning-seen");
    if (seen === today) return;
    setLoading(true);
    api
      .get("/ai/morning")
      .then((res) => {
        setContent(res.data.content);
        localStorage.setItem("morning-seen", today);
      })
      .finally(() => setLoading(false));
  }, [user?.morningMotivation]);

  if (!user?.morningMotivation || dismissed || (!content && !loading))
    return null;

  return (
    <div className="relative py-4 border-y border-zinc-800/70 animate-slide-up">
       <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-soft hover:text-[var(--text)] z-10"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-3 pr-6 relative">
        <div className="w-9 h-9 border border-zinc-700 text-zinc-200 flex items-center justify-center shrink-0 rounded-sm">
          <Sun size={20} />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Good morning, {user.name?.split(" ")[0]}
          </div>
          <div className="mt-1 text-sm">
            {loading ? (
              "Thinking of something nice to say..."
            ) : (
              <Markdown>{content}</Markdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
