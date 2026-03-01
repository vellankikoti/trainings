# Requirements — Server Monitoring and Alerting System

## System Requirements

| Requirement   | Minimum Version | Notes                                      |
|---------------|----------------|--------------------------------------------|
| Python        | 3.10+          | 3.11 recommended; available in lab image   |
| Git           | 2.30+          | For version control and branching          |
| Bash          | 5.0+           | For the monitoring shell script            |
| Linux         | Any modern     | Ubuntu, Debian, or the provided lab image  |
| jq            | 1.6+           | For JSON validation (optional but helpful) |
| ShellCheck    | 0.8+           | For linting the Bash script                |
| curl          | 7.0+           | Used in network checks and testing         |
| Docker        | 20.10+         | Only needed to run the lab environment     |
| Docker Compose| 2.0+           | Only needed to run the lab environment     |

---

## Feature Requirements by Phase

### Phase 1: Infrastructure Setup

#### P1-FR-01: Git Repository Initialization

- The project MUST be a Git repository initialized with `git init`.
- The repository MUST contain a `.gitignore` file that excludes at minimum:
  - `venv/` and `__pycache__/`
  - `.env` and `*.pyc`
  - IDE-specific directories (`.vscode/`, `.idea/`)
  - The `logs/` directory contents (but not the directory itself)
- The initial commit MUST include the project skeleton (directory structure,
  `.gitignore`, and `README.md`).

#### P1-FR-02: Directory Structure

- The project MUST contain the following top-level directories:
  - `metrics/` — for stored metric snapshots
  - `reports/` — for generated reports
  - `logs/` — for application log files
  - `tests/` — for test scripts
- Each directory MUST contain a `.gitkeep` file if it would otherwise be empty.

#### P1-FR-03: Virtual Environment

- A Python virtual environment MUST be creatable with `python3 -m venv venv`.
- All Python dependencies MUST be listed in `requirements.txt` with version
  constraints.
- Running `pip install -r requirements.txt` inside the virtual environment
  MUST succeed without errors.

#### P1-FR-04: README Documentation

- `README.md` MUST include:
  - Project title and a one-paragraph description.
  - A "Prerequisites" section listing required software.
  - A "Quick Start" section with copy-pasteable setup commands.
  - A "Usage" section showing how to run each component.
  - A "Project Structure" section explaining the directory layout.
  - A "Configuration" section explaining `config.yaml` options.

#### P1-FR-05: Branching Strategy

- Each phase MUST be developed on a dedicated feature branch.
- Branches MUST follow the naming pattern `phase-N/description`
  (e.g., `phase-2/monitoring-scripts`).
- Each branch MUST be merged into `main` after the phase is complete.
- The repository MUST have at least 15 total commits across all branches.

**Acceptance Criteria:**
- [ ] `git log --oneline` shows at least 15 commits with meaningful messages.
- [ ] `git branch` shows evidence of feature branches (or `git log --all` shows
      merge commits from feature branches).
- [ ] `README.md` is complete and accurate.
- [ ] `pip install -r requirements.txt` succeeds in a fresh virtual environment.

---

### Phase 2: System Monitoring Scripts

#### P2-FR-01: CPU Monitoring

- `monitor.sh` MUST implement a `check_cpu` function.
- The function MUST output a JSON object containing:
  - `metric`: `"cpu"`
  - `value`: CPU usage as a float percentage (0.0 to 100.0)
  - `unit`: `"percent"`
  - `timestamp`: UTC timestamp in ISO 8601 format
- The function MUST work using `/proc/stat`, `top`, or `mpstat`.

#### P2-FR-02: Memory Monitoring

- `monitor.sh` MUST implement a `check_memory` function.
- The function MUST output a JSON object containing:
  - `metric`: `"memory"`
  - `total_mb`: total memory in megabytes
  - `used_mb`: used memory in megabytes
  - `available_mb`: available memory in megabytes
  - `percent`: usage percentage as a float
  - `timestamp`: UTC timestamp in ISO 8601 format

#### P2-FR-03: Disk Monitoring

- `monitor.sh` MUST implement a `check_disk` function.
- The function MUST output a JSON object containing:
  - `metric`: `"disk"`
  - `filesystems`: an array of objects, each with:
    - `mount`: mount point path
    - `total_gb`: total size in gigabytes
    - `used_gb`: used space in gigabytes
    - `available_gb`: available space in gigabytes
    - `percent`: usage percentage
  - `timestamp`: UTC timestamp in ISO 8601 format

#### P2-FR-04: Network Monitoring

- `monitor.sh` MUST implement a `check_network` function.
- The function MUST output a JSON object containing:
  - `metric`: `"network"`
  - `interfaces`: an array of objects, each with:
    - `name`: interface name
    - `rx_bytes`: received bytes
    - `tx_bytes`: transmitted bytes
  - `connections`: count of active network connections
  - `timestamp`: UTC timestamp in ISO 8601 format

#### P2-FR-05: Combined Output

- Running `./monitor.sh` MUST produce a single JSON document to stdout
  containing all four metrics.
- The combined document MUST have the structure:
  ```json
  {
    "hostname": "...",
    "collected_at": "...",
    "metrics": {
      "cpu": { ... },
      "memory": { ... },
      "disk": { ... },
      "network": { ... }
    }
  }
  ```
- The output MUST be valid JSON (verifiable with `jq`).

#### P2-FR-06: Metric File Storage

- The script MUST save its output to `metrics/metric-YYYY-MM-DD-HHMMSS.json`.
- The filename MUST use the UTC timestamp of the collection.
- Existing files MUST NOT be overwritten.

#### P2-FR-07: Error Handling

- If a required tool (e.g., `mpstat`) is not installed, the script MUST:
  - Print a warning to stderr.
  - Continue collecting other metrics.
  - Include a `"status": "error"` field in the JSON for that metric.
- The script MUST NOT exit with a non-zero code due to a missing optional tool.

#### P2-FR-08: Cron Integration

- The project MUST include a documented cron entry that runs `monitor.sh`
  every minute.
- The cron entry MUST be documented in the README.

**Acceptance Criteria:**
- [ ] `./monitor.sh | jq .` produces valid, properly structured JSON.
- [ ] `ls metrics/` shows timestamped metric files after multiple runs.
- [ ] Removing a tool (e.g., `mpstat`) does not crash the script.
- [ ] `shellcheck monitor.sh` reports zero errors.

---

### Phase 3: Python Automation

#### P3-FR-01: MetricCollector Class

- MUST load configuration from `config.yaml` using the `pyyaml` library.
- MUST read the most recent metric file from `metrics/`.
- MUST support optionally invoking `monitor.sh` via `subprocess.run()`.
- MUST parse JSON metric data into Python dictionaries or dataclasses.
- MUST handle missing or corrupted metric files gracefully.

#### P3-FR-02: AlertManager Class

- MUST compare metric values to thresholds defined in `config.yaml`.
- MUST support two alert channels:
  - `console`: Print formatted alerts to stdout.
  - `webhook`: Send an HTTP POST request to the configured webhook URL.
- Alert messages MUST include:
  - Severity level (`WARNING` or `CRITICAL`).
  - Metric name.
  - Current value.
  - Threshold value.
- MUST implement alert cooldown: do not send the same alert more than once
  within a configurable window (default: 5 minutes).
- MUST handle webhook delivery failures without crashing.

#### P3-FR-03: ReportGenerator Class

- MUST read all metric files from `metrics/`.
- MUST compute summary statistics: minimum, maximum, and average for each
  numeric metric.
- MUST generate a terminal-formatted report to stdout.
- MUST generate an HTML report saved to `reports/report-YYYY-MM-DD.html`.
- MUST include trend indicators:
  - Upward trend: metric average is increasing over the last N samples.
  - Downward trend: metric average is decreasing.
  - Stable: metric average has not changed significantly.

#### P3-FR-04: Logging

- MUST use Python's built-in `logging` module.
- MUST log to both the console and `logs/monitor.log`.
- MUST use appropriate log levels:
  - `INFO` for normal operations (startup, metric collection).
  - `WARNING` for threshold breaches and recoverable errors.
  - `ERROR` for failures (file I/O errors, webhook failures).
  - `DEBUG` for verbose diagnostic information.

#### P3-FR-05: Error Handling

- All file I/O operations MUST be wrapped in try/except blocks.
- All network operations MUST be wrapped in try/except blocks.
- All subprocess calls MUST be wrapped in try/except blocks.
- Exceptions MUST be logged with full tracebacks at the `ERROR` level.
- The application MUST NOT crash due to an unhandled exception.

**Acceptance Criteria:**
- [ ] `python3 monitor.py` executes without errors.
- [ ] Alerts appear in the console when thresholds are exceeded.
- [ ] A webhook POST is sent when the webhook channel is enabled.
- [ ] `reports/` contains a generated HTML report.
- [ ] `logs/monitor.log` contains structured log entries.
- [ ] All classes and functions have docstrings.

---

### Phase 4: Network Health Checks

#### P4-FR-01: HTTP Endpoint Monitoring

- MUST read endpoints from the `endpoints` section of `config.yaml`.
- MUST send an HTTP GET request to each endpoint.
- MUST record: URL, HTTP status code, response time in milliseconds,
  and whether the endpoint is healthy (status code 200 by default).
- MUST handle connection timeouts (configurable, default 5 seconds).
- MUST handle connection refused and DNS resolution errors.

#### P4-FR-02: DNS Resolution Monitoring

- MUST resolve a configurable list of hostnames.
- MUST record: hostname, resolved IP addresses, resolution time in
  milliseconds, and success/failure status.
- MUST detect and report DNS resolution failures.

#### P4-FR-03: Port Availability Checks

- MUST attempt TCP connections to a configurable list of host:port pairs.
- MUST record: host, port, whether the port is open, and connection time
  in milliseconds.
- MUST handle connection refused and timeout scenarios.

#### P4-FR-04: Response Time Tracking

- MUST store response times for all network checks over time.
- MUST calculate average, 95th percentile, and 99th percentile response
  times.
- MUST alert when response times exceed a configurable threshold.

#### P4-FR-05: Integration

- Network check results MUST be included in the main monitoring output.
- Network check results MUST appear in generated reports.
- Network check failures MUST trigger alerts through the AlertManager.

**Acceptance Criteria:**
- [ ] HTTP checks correctly report healthy and unhealthy endpoints.
- [ ] DNS checks detect resolution failures.
- [ ] Port checks detect open and closed ports.
- [ ] Response times are recorded and percentiles are calculated.
- [ ] Network check results appear in the dashboard and reports.

---

### Phase 5: Dashboard and Reporting

#### P5-FR-01: Terminal Dashboard

- MUST display current values for CPU, memory, disk, and network metrics.
- MUST color-code values based on proximity to thresholds:
  - Green: below 60% of threshold value.
  - Yellow: between 60% and 90% of threshold value.
  - Red: above 90% of threshold value.
- MUST display network health check results with up/down indicators.
- MUST display the 10 most recent alerts.
- MUST display system uptime and time since last metric collection.
- MAY use the `rich` library or plain ANSI escape codes.

#### P5-FR-02: Auto-Refresh

- The dashboard MUST refresh automatically at a configurable interval
  (default: 60 seconds).
- The refresh MUST clear the terminal and redraw all content.
- The user MUST be able to exit with Ctrl+C.

#### P5-FR-03: Daily Reports

- MUST include metric averages, peaks, and lows for the current day.
- MUST include the number and severity of alerts triggered.
- MUST include endpoint availability percentage for each monitored endpoint.
- MUST include trend analysis for each metric.

#### P5-FR-04: Weekly Reports

- MUST include day-over-day metric comparisons.
- MUST identify the worst-performing metrics of the week.
- MUST include actionable recommendations based on observed trends.

#### P5-FR-05: CLI Arguments

- The application MUST support the following CLI arguments via `argparse`:
  - (no arguments): Run a single metric collection and alert check.
  - `--dashboard`: Launch the live terminal dashboard.
  - `--report daily`: Generate a daily summary report.
  - `--report weekly`: Generate a weekly summary report.
  - `--check-network`: Run network health checks only.
  - `--config PATH`: Specify a custom configuration file path.
  - `--verbose`: Enable debug-level logging.
- `--help` MUST display usage information for all arguments.

**Acceptance Criteria:**
- [ ] `python3 monitor.py --dashboard` renders a color-coded dashboard.
- [ ] The dashboard refreshes automatically.
- [ ] `python3 monitor.py --report daily` generates a daily report.
- [ ] `python3 monitor.py --report weekly` generates a weekly report.
- [ ] `python3 monitor.py --help` displays usage information.
- [ ] Ctrl+C exits the dashboard cleanly.

---

## Bonus Features (Extra Credit)

These features are not required but will earn additional recognition:

| Feature                  | Description                                              |
|--------------------------|----------------------------------------------------------|
| SQLite storage           | Store metrics in SQLite instead of JSON files            |
| Email alerts             | Send alerts via SMTP                                     |
| Metric charts            | Generate PNG charts using matplotlib                     |
| Config validation        | Validate config.yaml against a schema on startup         |
| Systemd unit file        | Run the monitor as a systemd service                     |
| Multi-host monitoring    | Collect metrics from remote hosts via SSH                |
| REST API                 | Expose metrics via a Flask or FastAPI endpoint           |
| Anomaly detection        | Alert on statistical anomalies (2+ standard deviations) |
| Unit test suite          | pytest-based tests with at least 80% code coverage       |
| CI pipeline              | GitHub Actions workflow that runs linting and tests      |

---

## Expected File Structure

```
server-monitor/
├── .git/
├── .gitignore
├── README.md
├── requirements.txt
├── config.yaml
├── monitor.sh
├── monitor.py
├── metrics/
│   ├── .gitkeep
│   └── metric-2026-03-01-143000.json   (generated)
├── reports/
│   ├── .gitkeep
│   └── report-2026-03-01.html          (generated)
├── logs/
│   ├── .gitkeep
│   └── monitor.log                     (generated)
└── tests/
    ├── test_monitor.sh
    └── test_monitor.py
```

---

## Non-Functional Requirements

1. **Performance:** A single metric collection cycle MUST complete in under
   10 seconds.
2. **Reliability:** The system MUST not crash due to transient errors (missing
   files, network timeouts, unavailable endpoints).
3. **Security:** No secrets (webhook URLs, passwords) should be committed to
   Git. Use environment variables or a `.env` file (excluded via `.gitignore`).
4. **Portability:** The project MUST run in the provided Docker lab environment
   without modification (aside from `config.yaml` endpoint URLs).
5. **Maintainability:** Code MUST be modular. Each class should have a single
   responsibility. Functions should be short and focused.
