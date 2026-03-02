"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface TerminalProps {
  initialCommands?: string[];
  commands?: Record<string, string>;
  title?: string;
  height?: number;
  readOnly?: boolean;
  prompt?: string;
  user?: string;
  hostname?: string;
}

interface HistoryEntry {
  command: string;
  output: string;
}

const DEFAULT_COMMANDS: Record<string, string> = {
  help: "Available commands: help, clear, whoami, pwd, date, echo, ls, cat, uname\nType a command and press Enter.",
  whoami: "learner",
  pwd: "/home/learner",
  date: new Date().toString(),
  "uname -a": "Linux devops-lab 5.15.0-89-generic #99-Ubuntu SMP x86_64 GNU/Linux",
  "uname -r": "5.15.0-89-generic",
  ls: "Desktop  Documents  Downloads  projects",
  "ls -la": "total 32\ndrwxr-xr-x 6 learner learner 4096 Mar  1 10:00 .\ndrwxr-xr-x 3 root    root    4096 Mar  1 09:00 ..\n-rw-r--r-- 1 learner learner  220 Mar  1 09:00 .bash_logout\n-rw-r--r-- 1 learner learner 3771 Mar  1 09:00 .bashrc\n-rw-r--r-- 1 learner learner  807 Mar  1 09:00 .profile\ndrwxr-xr-x 2 learner learner 4096 Mar  1 10:00 Desktop\ndrwxr-xr-x 2 learner learner 4096 Mar  1 10:00 Documents\ndrwxr-xr-x 2 learner learner 4096 Mar  1 10:00 Downloads\ndrwxr-xr-x 2 learner learner 4096 Mar  1 10:00 projects",
  "ls /": "bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var",
  "cat /etc/os-release": 'PRETTY_NAME="Ubuntu 22.04.3 LTS"\nNAME="Ubuntu"\nVERSION_ID="22.04"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nVERSION_CODENAME=jammy\nID=ubuntu\nID_LIKE=debian',
  hostname: "devops-lab",
  uptime: " 10:00:00 up 1 day,  2:30,  1 user,  load average: 0.08, 0.03, 0.01",
  "free -h": "               total        used        free      shared  buff/cache   available\nMem:           7.7Gi       1.2Gi       5.3Gi        18Mi       1.2Gi       6.2Gi\nSwap:          2.0Gi          0B       2.0Gi",
  "df -h": "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G  8.2G   39G  18% /\ntmpfs           3.9G     0  3.9G   0% /dev/shm\ntmpfs           786M  1.1M  785M   1% /run",
  "ps aux": "USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot           1  0.0  0.1 169324 11720 ?        Ss   Mar01   0:01 /sbin/init\nroot          42  0.0  0.0  16536  5736 ?        Ss   Mar01   0:00 /lib/systemd/systemd-journald\nlearner     1001  0.0  0.0   8276  5132 pts/0    Ss   10:00   0:00 -bash\nlearner     1042  0.0  0.0  10072  3432 pts/0    R+   10:00   0:00 ps aux",
};

export function Terminal({
  initialCommands = [],
  commands: customCommands,
  title = "Terminal",
  height = 320,
  readOnly = false,
  user = "learner",
  hostname = "devops-lab",
}: TerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCommands = { ...DEFAULT_COMMANDS, ...customCommands };
  const promptStr = `${user}@${hostname}:~$`;

  const processCommand = useCallback(
    (cmd: string): string => {
      const trimmed = cmd.trim();
      if (!trimmed) return "";
      if (trimmed === "clear") return "__CLEAR__";

      if (trimmed.startsWith("echo ")) {
        const arg = trimmed.slice(5).replace(/^["']|["']$/g, "");
        return arg;
      }

      if (allCommands[trimmed]) {
        return allCommands[trimmed];
      }

      return `bash: ${trimmed.split(" ")[0]}: command not found`;
    },
    [allCommands]
  );

  useEffect(() => {
    if (initialCommands.length > 0) {
      const entries: HistoryEntry[] = [];
      for (const cmd of initialCommands) {
        const output = processCommand(cmd);
        if (output !== "__CLEAR__") {
          entries.push({ command: cmd, output });
        }
      }
      setHistory(entries);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();

      if (trimmed) {
        setCommandHistory((prev) => [...prev, trimmed]);
        setHistoryIndex(-1);
      }

      const output = processCommand(trimmed);
      if (output === "__CLEAR__") {
        setHistory([]);
      } else {
        setHistory((prev) => [...prev, { command: trimmed, output }]);
      }
      setInput("");
    },
    [input, processCommand]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const newIndex =
            historyIndex === -1
              ? commandHistory.length - 1
              : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
            setHistoryIndex(-1);
            setInput("");
          } else {
            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
          }
        }
      }
    },
    [commandHistory, historyIndex]
  );

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-border/60 shadow-lg">
      {/* Terminal header */}
      <div className="flex items-center gap-2 bg-[hsl(215,28%,13%)] px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 font-mono text-xs text-[hsl(215,16%,50%)]">{title}</span>
        {!readOnly && (
          <span className="ml-auto rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-[hsl(215,16%,50%)]">
            interactive
          </span>
        )}
      </div>

      {/* Terminal body */}
      <div
        ref={terminalRef}
        className="overflow-y-auto overflow-x-auto bg-[hsl(215,28%,10%)] p-4 font-mono text-sm leading-relaxed text-[hsl(210,40%,90%)] cursor-text"
        style={{ height }}
        onClick={focusInput}
        role="textbox"
        tabIndex={0}
        aria-label="Terminal"
      >
        {history.map((entry, i) => (
          <div key={i} className="mb-1">
            <div>
              <span className="text-emerald-400">{promptStr}</span>{" "}
              <span>{entry.command}</span>
            </div>
            {entry.output && (
              <pre className="whitespace-pre-wrap text-[hsl(210,40%,90%)]">
                {entry.output}
              </pre>
            )}
          </div>
        ))}

        {!readOnly && (
          <form onSubmit={handleSubmit} className="flex">
            <span className="text-emerald-400">{promptStr}</span>
            <span>&nbsp;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-[hsl(210,40%,90%)] outline-none caret-[#f5e0dc]"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input"
            />
          </form>
        )}
      </div>
    </div>
  );
}
