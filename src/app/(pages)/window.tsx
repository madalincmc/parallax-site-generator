/** The site's terminal window, drawn in CSS, as the frame for a page's opening command. */
export function TerminalBar({ path, command }: { path: string; command: string }) {
  return (
    <div className="font-mono text-xs">
      <div className="text-muted flex items-center gap-2 rounded-t-lg border border-white/10 bg-white/5 px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate">{path} — zsh</span>
      </div>
      <p className="truncate rounded-b-lg border border-t-0 border-white/10 px-3 py-2.5">
        <span className="text-[#28c840]">$</span> {command}
      </p>
    </div>
  );
}
