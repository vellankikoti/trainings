#!/usr/bin/env python3
"""
Server Monitoring System — Foundations Capstone Project
=======================================================

A complete server monitoring system that collects system metrics, checks
network health, sends alerts when thresholds are breached, and presents
data through a terminal dashboard and generated reports.

Usage:
    python3 monitor.py                     # Single collection + alert check
    python3 monitor.py --dashboard         # Launch live dashboard
    python3 monitor.py --report daily      # Generate daily report
    python3 monitor.py --report weekly     # Generate weekly report
    python3 monitor.py --check-network     # Run network checks only
    python3 monitor.py --config PATH       # Use custom config file
    python3 monitor.py --verbose           # Enable debug logging
"""

import argparse
import json
import logging
import os
import socket
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# Third-party imports — install via: pip install -r requirements.txt
try:
    import requests
except ImportError:
    requests = None
    print("Warning: 'requests' not installed. Webhook alerts disabled.", file=sys.stderr)

try:
    import yaml
except ImportError:
    yaml = None
    print("Warning: 'pyyaml' not installed. Cannot load config.yaml.", file=sys.stderr)

try:
    import psutil
except ImportError:
    psutil = None
    print("Warning: 'psutil' not installed. Python-based metrics disabled.", file=sys.stderr)

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.layout import Layout
    from rich.live import Live
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DEFAULT_CONFIG = BASE_DIR / "config.yaml"
METRICS_DIR = BASE_DIR / "metrics"
REPORTS_DIR = BASE_DIR / "reports"
LOGS_DIR = BASE_DIR / "logs"


# ---------------------------------------------------------------------------
# Logging Setup
# ---------------------------------------------------------------------------
def setup_logging(verbose: bool = False) -> logging.Logger:
    """
    Configure logging to write to both the console and a log file.

    Args:
        verbose: If True, set log level to DEBUG. Otherwise, use INFO.

    Returns:
        Configured logger instance.
    """
    # TODO: Implement logging setup
    #
    # Requirements:
    #   - Create a logger named "monitor"
    #   - Set level to DEBUG if verbose, else INFO
    #   - Add a StreamHandler for console output (level INFO or DEBUG)
    #   - Add a FileHandler writing to LOGS_DIR / "monitor.log" (level DEBUG)
    #   - Use a formatter that includes: timestamp, level, module, message
    #   - Ensure the logs directory exists
    #
    # Example format:
    #   "2026-03-01 14:30:00 [INFO] monitor - Metric collection started"

    logger = logging.getLogger("monitor")
    logger.setLevel(logging.DEBUG if verbose else logging.INFO)
    # TODO: Add handlers and formatters
    return logger


# ---------------------------------------------------------------------------
# Configuration Loading
# ---------------------------------------------------------------------------
def load_config(config_path: Path) -> dict:
    """
    Load monitoring configuration from a YAML file.

    Args:
        config_path: Path to the YAML configuration file.

    Returns:
        Dictionary containing the configuration.

    Raises:
        FileNotFoundError: If the config file does not exist.
        yaml.YAMLError: If the config file contains invalid YAML.
    """
    # TODO: Implement configuration loading
    #
    # Requirements:
    #   - Read the YAML file at config_path
    #   - Return the parsed dictionary
    #   - Handle FileNotFoundError with a helpful error message
    #   - Handle yaml.YAMLError with a helpful error message
    #   - Log the loaded configuration at DEBUG level
    #
    # Hint: Use yaml.safe_load() to parse the file

    raise NotImplementedError("TODO: Implement load_config")


# ===========================================================================
# TODO: Implement the MetricCollector class
# ===========================================================================
class MetricCollector:
    """
    Collects system metrics by reading output from monitor.sh or using psutil.

    Responsibilities:
        - Invoke the Bash monitoring script (monitor.sh) via subprocess.
        - Read the latest metric file from the metrics/ directory.
        - Parse JSON metric data into Python dictionaries.
        - Provide a unified interface for accessing current metrics.

    Attributes:
        config (dict): The loaded configuration dictionary.
        logger (logging.Logger): Logger instance.
        metrics_dir (Path): Path to the metrics directory.
    """

    def __init__(self, config: dict, logger: logging.Logger):
        """
        Initialize the MetricCollector.

        Args:
            config: Configuration dictionary loaded from config.yaml.
            logger: Logger instance for recording events.
        """
        self.config = config
        self.logger = logger
        self.metrics_dir = METRICS_DIR
        # TODO: Complete initialization

    def collect(self) -> dict:
        """
        Collect current system metrics.

        This method should:
            1. Try to run monitor.sh and capture its JSON output.
            2. If monitor.sh fails, fall back to reading the latest metric file.
            3. If psutil is available, optionally collect metrics directly.
            4. Return the parsed metric data as a dictionary.

        Returns:
            Dictionary containing the collected metrics.

        Raises:
            RuntimeError: If no metrics could be collected from any source.
        """
        # TODO: Implement metric collection
        raise NotImplementedError("TODO: Implement MetricCollector.collect")

    def _run_bash_collector(self) -> dict:
        """
        Run monitor.sh and return parsed JSON output.

        Returns:
            Parsed metric data dictionary.

        Raises:
            subprocess.CalledProcessError: If the script exits with an error.
            json.JSONDecodeError: If the output is not valid JSON.
        """
        # TODO: Implement subprocess call to monitor.sh
        #
        # Hint:
        #   result = subprocess.run(
        #       ["bash", str(BASE_DIR / "monitor.sh")],
        #       capture_output=True, text=True, timeout=30
        #   )
        raise NotImplementedError("TODO: Implement _run_bash_collector")

    def _read_latest_metrics(self) -> dict:
        """
        Read the most recent metric file from the metrics/ directory.

        Returns:
            Parsed metric data dictionary.

        Raises:
            FileNotFoundError: If no metric files exist.
        """
        # TODO: Implement reading the latest metric file
        #
        # Hint:
        #   - Use sorted(self.metrics_dir.glob("metric-*.json")) to list files
        #   - The last file in sorted order is the most recent
        #   - Read and parse with json.loads()
        raise NotImplementedError("TODO: Implement _read_latest_metrics")


# ===========================================================================
# TODO: Implement the AlertManager class
# ===========================================================================
class AlertManager:
    """
    Evaluates metrics against thresholds and sends alerts.

    Responsibilities:
        - Compare metric values to configured thresholds.
        - Determine alert severity (WARNING or CRITICAL).
        - Send alerts via configured channels (console, webhook).
        - Implement cooldown to prevent alert flooding.

    Attributes:
        config (dict): The loaded configuration dictionary.
        logger (logging.Logger): Logger instance.
        cooldowns (dict): Tracks when alerts were last sent per metric.
    """

    def __init__(self, config: dict, logger: logging.Logger):
        """
        Initialize the AlertManager.

        Args:
            config: Configuration dictionary loaded from config.yaml.
            logger: Logger instance for recording events.
        """
        self.config = config
        self.logger = logger
        self.cooldowns: dict[str, datetime] = {}
        self.cooldown_minutes = 5  # TODO: Read from config
        # TODO: Complete initialization

    def evaluate(self, metrics: dict) -> list[dict]:
        """
        Evaluate metrics against thresholds and return a list of alerts.

        Each alert should be a dictionary with:
            - severity: "WARNING" or "CRITICAL"
            - metric: Name of the metric
            - value: Current value
            - threshold: Configured threshold
            - message: Human-readable alert message
            - timestamp: UTC ISO 8601 timestamp

        Args:
            metrics: Dictionary of collected metrics.

        Returns:
            List of alert dictionaries.
        """
        # TODO: Implement threshold evaluation
        #
        # Logic:
        #   - For each metric in config["thresholds"]:
        #     - If current value >= threshold: create a CRITICAL alert
        #     - If current value >= threshold * 0.9: create a WARNING alert
        #   - Check cooldowns before adding to the alert list
        raise NotImplementedError("TODO: Implement AlertManager.evaluate")

    def send(self, alerts: list[dict]) -> None:
        """
        Send alerts through all configured channels.

        Args:
            alerts: List of alert dictionaries to send.
        """
        # TODO: Implement alert sending
        #
        # For each alert:
        #   - If "console" in config channels: call _send_console(alert)
        #   - If "webhook" in config channels: call _send_webhook(alert)
        #   - Update cooldown tracking
        raise NotImplementedError("TODO: Implement AlertManager.send")

    def _send_console(self, alert: dict) -> None:
        """
        Print an alert to the console with color formatting.

        Args:
            alert: Alert dictionary to display.
        """
        # TODO: Implement console alert output
        #
        # Example output:
        #   [CRITICAL] CPU usage at 92.3% (threshold: 80%)
        #   [WARNING]  Memory usage at 84.1% (threshold: 85%)
        raise NotImplementedError("TODO: Implement _send_console")

    def _send_webhook(self, alert: dict) -> None:
        """
        Send an alert to a Slack-compatible webhook.

        Args:
            alert: Alert dictionary to send.
        """
        # TODO: Implement webhook alert sending
        #
        # Requirements:
        #   - POST to the webhook URL from config
        #   - Send JSON payload: {"text": "<alert message>"}
        #   - Handle connection errors and timeouts
        #   - Log success or failure
        #
        # Hint:
        #   requests.post(url, json={"text": message}, timeout=10)
        raise NotImplementedError("TODO: Implement _send_webhook")

    def _is_in_cooldown(self, metric_name: str) -> bool:
        """
        Check if an alert for the given metric is in cooldown.

        Args:
            metric_name: Name of the metric to check.

        Returns:
            True if the alert is in cooldown and should not be sent.
        """
        # TODO: Implement cooldown check
        raise NotImplementedError("TODO: Implement _is_in_cooldown")


# ===========================================================================
# TODO: Implement the NetworkChecker class
# ===========================================================================
class NetworkChecker:
    """
    Performs network health checks: HTTP endpoints, DNS, and ports.

    Responsibilities:
        - Check HTTP endpoint availability and response times.
        - Verify DNS name resolution.
        - Test TCP port availability.
        - Track response times over multiple checks.

    Attributes:
        config (dict): The loaded configuration dictionary.
        logger (logging.Logger): Logger instance.
        history (list): Historical response time data.
    """

    def __init__(self, config: dict, logger: logging.Logger):
        """
        Initialize the NetworkChecker.

        Args:
            config: Configuration dictionary loaded from config.yaml.
            logger: Logger instance for recording events.
        """
        self.config = config
        self.logger = logger
        self.history: list[dict] = []
        # TODO: Complete initialization

    def check_endpoint(self, url: str, timeout: int = 5) -> dict:
        """
        Check if an HTTP endpoint is healthy.

        Args:
            url: The URL to check.
            timeout: Request timeout in seconds.

        Returns:
            Dictionary with keys:
                - url (str): The checked URL.
                - status_code (int or None): HTTP status code.
                - response_time_ms (float): Response time in milliseconds.
                - healthy (bool): Whether the endpoint is healthy.
                - error (str or None): Error message if the check failed.
        """
        # TODO: Implement HTTP endpoint check
        #
        # Hint:
        #   start = time.time()
        #   response = requests.get(url, timeout=timeout)
        #   elapsed_ms = (time.time() - start) * 1000
        raise NotImplementedError("TODO: Implement check_endpoint")

    def check_dns(self, hostname: str) -> dict:
        """
        Check if a hostname resolves correctly via DNS.

        Args:
            hostname: The hostname to resolve.

        Returns:
            Dictionary with keys:
                - hostname (str): The checked hostname.
                - resolved_ips (list[str]): Resolved IP addresses.
                - resolution_time_ms (float): Time to resolve in ms.
                - success (bool): Whether resolution succeeded.
                - error (str or None): Error message if resolution failed.
        """
        # TODO: Implement DNS resolution check
        #
        # Hint:
        #   start = time.time()
        #   results = socket.getaddrinfo(hostname, None)
        #   elapsed_ms = (time.time() - start) * 1000
        #   ips = list(set(r[4][0] for r in results))
        raise NotImplementedError("TODO: Implement check_dns")

    def check_port(self, host: str, port: int, timeout: int = 3) -> dict:
        """
        Check if a TCP port is open on a given host.

        Args:
            host: The hostname or IP address.
            port: The port number to check.
            timeout: Connection timeout in seconds.

        Returns:
            Dictionary with keys:
                - host (str): The checked host.
                - port (int): The checked port.
                - open (bool): Whether the port is open.
                - response_time_ms (float): Connection time in ms.
                - error (str or None): Error message if the check failed.
        """
        # TODO: Implement port availability check
        #
        # Hint:
        #   start = time.time()
        #   sock = socket.create_connection((host, port), timeout=timeout)
        #   elapsed_ms = (time.time() - start) * 1000
        #   sock.close()
        raise NotImplementedError("TODO: Implement check_port")

    def run_all_checks(self) -> dict:
        """
        Run all configured network checks and return results.

        Returns:
            Dictionary with keys:
                - endpoints (list[dict]): HTTP endpoint check results.
                - dns (list[dict]): DNS resolution check results.
                - ports (list[dict]): Port availability check results.
                - checked_at (str): UTC ISO 8601 timestamp.
        """
        # TODO: Implement combined network check execution
        raise NotImplementedError("TODO: Implement run_all_checks")

    def get_response_time_stats(self) -> dict:
        """
        Calculate response time statistics from historical data.

        Returns:
            Dictionary with average, p95, and p99 response times.
        """
        # TODO: Implement response time percentile calculations
        #
        # Hint:
        #   - Sort the response times
        #   - p95 = sorted_times[int(len(sorted_times) * 0.95)]
        #   - p99 = sorted_times[int(len(sorted_times) * 0.99)]
        raise NotImplementedError("TODO: Implement get_response_time_stats")


# ===========================================================================
# TODO: Implement the ReportGenerator class
# ===========================================================================
class ReportGenerator:
    """
    Generates monitoring reports from collected metric data.

    Responsibilities:
        - Read historical metric files.
        - Compute summary statistics (min, max, avg).
        - Detect trends (increasing, decreasing, stable).
        - Generate terminal-formatted reports.
        - Generate HTML reports.

    Attributes:
        config (dict): The loaded configuration dictionary.
        logger (logging.Logger): Logger instance.
        metrics_dir (Path): Path to the metrics directory.
        reports_dir (Path): Path to the reports directory.
    """

    def __init__(self, config: dict, logger: logging.Logger):
        """
        Initialize the ReportGenerator.

        Args:
            config: Configuration dictionary loaded from config.yaml.
            logger: Logger instance for recording events.
        """
        self.config = config
        self.logger = logger
        self.metrics_dir = METRICS_DIR
        self.reports_dir = REPORTS_DIR
        # TODO: Complete initialization

    def generate_daily_report(self) -> str:
        """
        Generate a daily summary report.

        Reads all metric files from today, computes statistics, and returns
        a formatted report string. Also saves an HTML version.

        Returns:
            Formatted report string for terminal display.
        """
        # TODO: Implement daily report generation
        #
        # Include:
        #   - Date range covered
        #   - Metric averages, peaks, and lows
        #   - Number of alerts triggered
        #   - Endpoint availability percentages
        #   - Trend indicators (up, down, stable)
        raise NotImplementedError("TODO: Implement generate_daily_report")

    def generate_weekly_report(self) -> str:
        """
        Generate a weekly summary report.

        Reads metric files from the past 7 days and generates a report
        with day-over-day comparisons.

        Returns:
            Formatted report string for terminal display.
        """
        # TODO: Implement weekly report generation
        #
        # Include:
        #   - Day-over-day metric comparisons
        #   - Worst-performing metrics
        #   - Actionable recommendations
        raise NotImplementedError("TODO: Implement generate_weekly_report")

    def _generate_html_report(self, data: dict, report_type: str) -> Path:
        """
        Generate an HTML report file.

        Args:
            data: Report data dictionary.
            report_type: "daily" or "weekly".

        Returns:
            Path to the generated HTML file.
        """
        # TODO: Implement HTML report generation
        #
        # Requirements:
        #   - Create a well-structured HTML document
        #   - Include a summary table with metrics
        #   - Use inline CSS for styling (no external dependencies)
        #   - Save to reports/report-YYYY-MM-DD.html
        raise NotImplementedError("TODO: Implement _generate_html_report")

    def _compute_statistics(self, values: list[float]) -> dict:
        """
        Compute summary statistics for a list of values.

        Args:
            values: List of numeric values.

        Returns:
            Dictionary with min, max, avg, and count.
        """
        # TODO: Implement statistics calculation
        raise NotImplementedError("TODO: Implement _compute_statistics")

    def _detect_trend(self, values: list[float]) -> str:
        """
        Detect whether a metric is trending up, down, or stable.

        Compares the average of the first half to the second half.

        Args:
            values: Time-ordered list of metric values.

        Returns:
            One of: "increasing", "decreasing", "stable".
        """
        # TODO: Implement trend detection
        #
        # Simple approach:
        #   - Split values into first half and second half
        #   - Compare averages
        #   - If second half > first half * 1.05: "increasing"
        #   - If second half < first half * 0.95: "decreasing"
        #   - Otherwise: "stable"
        raise NotImplementedError("TODO: Implement _detect_trend")


# ===========================================================================
# TODO: Implement the Dashboard class
# ===========================================================================
class Dashboard:
    """
    Terminal-based monitoring dashboard.

    Displays real-time system metrics, network health, and recent alerts
    with color-coded indicators.

    Attributes:
        config (dict): The loaded configuration dictionary.
        logger (logging.Logger): Logger instance.
        collector (MetricCollector): For collecting fresh metrics.
        network_checker (NetworkChecker): For network health checks.
        refresh_interval (int): Seconds between dashboard refreshes.
    """

    def __init__(
        self,
        config: dict,
        logger: logging.Logger,
        collector: MetricCollector,
        network_checker: NetworkChecker,
    ):
        """
        Initialize the Dashboard.

        Args:
            config: Configuration dictionary loaded from config.yaml.
            logger: Logger instance for recording events.
            collector: MetricCollector instance.
            network_checker: NetworkChecker instance.
        """
        self.config = config
        self.logger = logger
        self.collector = collector
        self.network_checker = network_checker
        self.refresh_interval = config.get("monitoring", {}).get("interval", 60)
        # TODO: Complete initialization

    def run(self) -> None:
        """
        Launch the live dashboard with auto-refresh.

        The dashboard should:
            1. Clear the terminal.
            2. Collect current metrics.
            3. Run network checks.
            4. Display all data with color coding.
            5. Wait for the refresh interval.
            6. Repeat until the user presses Ctrl+C.

        Color coding rules:
            - Green: value < threshold * 0.6
            - Yellow: threshold * 0.6 <= value < threshold * 0.9
            - Red: value >= threshold * 0.9
        """
        # TODO: Implement the dashboard main loop
        #
        # If rich is available:
        #   - Use rich.live.Live for auto-updating display
        #   - Use rich.table.Table for metric tables
        #   - Use rich.panel.Panel for sections
        #
        # If rich is not available:
        #   - Use ANSI escape codes for colors:
        #     GREEN = "\033[92m"
        #     YELLOW = "\033[93m"
        #     RED = "\033[91m"
        #     RESET = "\033[0m"
        #   - Use os.system("clear") to clear the terminal
        #
        # Handle KeyboardInterrupt to exit cleanly.
        raise NotImplementedError("TODO: Implement Dashboard.run")

    def _get_color(self, value: float, threshold: float) -> str:
        """
        Determine the display color for a metric value.

        Args:
            value: Current metric value.
            threshold: Configured threshold for this metric.

        Returns:
            Color name or ANSI code string.
        """
        # TODO: Implement color determination
        raise NotImplementedError("TODO: Implement _get_color")


# ===========================================================================
# CLI Argument Parsing
# ===========================================================================
def parse_args() -> argparse.Namespace:
    """
    Parse command-line arguments.

    Returns:
        Parsed argument namespace.
    """
    parser = argparse.ArgumentParser(
        description="Server Monitoring System — Foundations Capstone",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                        Run a single metric collection and alert check
  %(prog)s --dashboard            Launch the live terminal dashboard
  %(prog)s --report daily         Generate a daily summary report
  %(prog)s --report weekly        Generate a weekly summary report
  %(prog)s --check-network        Run network health checks only
  %(prog)s --verbose              Enable debug logging
  %(prog)s --config myconfig.yaml Use a custom configuration file
        """,
    )

    parser.add_argument(
        "--dashboard",
        action="store_true",
        help="Launch the live terminal dashboard",
    )
    parser.add_argument(
        "--report",
        choices=["daily", "weekly"],
        help="Generate a summary report (daily or weekly)",
    )
    parser.add_argument(
        "--check-network",
        action="store_true",
        help="Run network health checks only",
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=DEFAULT_CONFIG,
        help="Path to configuration file (default: config.yaml)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug-level logging",
    )

    return parser.parse_args()


# ===========================================================================
# Main Entry Point
# ===========================================================================
def main() -> None:
    """
    Main entry point for the monitoring system.

    Parses CLI arguments and dispatches to the appropriate action:
        - Default: single metric collection + alert evaluation
        - --dashboard: launch live dashboard
        - --report: generate summary report
        - --check-network: run network checks only
    """
    args = parse_args()

    # Setup logging
    logger = setup_logging(verbose=args.verbose)
    logger.info("Server Monitoring System starting up")

    # Load configuration
    # TODO: Uncomment and implement after load_config is ready
    # try:
    #     config = load_config(args.config)
    # except Exception as e:
    #     logger.error("Failed to load configuration: %s", e)
    #     sys.exit(1)

    config = {}  # TODO: Replace with actual config loading

    # Initialize components
    # TODO: Uncomment after classes are implemented
    # collector = MetricCollector(config, logger)
    # alerter = AlertManager(config, logger)
    # network_checker = NetworkChecker(config, logger)
    # reporter = ReportGenerator(config, logger)

    # Dispatch based on CLI arguments
    if args.dashboard:
        # TODO: Launch dashboard
        # dashboard = Dashboard(config, logger, collector, network_checker)
        # dashboard.run()
        logger.error("Dashboard not yet implemented")

    elif args.report:
        # TODO: Generate report
        # if args.report == "daily":
        #     print(reporter.generate_daily_report())
        # elif args.report == "weekly":
        #     print(reporter.generate_weekly_report())
        logger.error("Report generation not yet implemented")

    elif args.check_network:
        # TODO: Run network checks
        # results = network_checker.run_all_checks()
        # print(json.dumps(results, indent=2))
        logger.error("Network checks not yet implemented")

    else:
        # Default: single collection + alert check
        # TODO: Implement the default flow
        #
        # metrics = collector.collect()
        # alerts = alerter.evaluate(metrics)
        # alerter.send(alerts)
        #
        # if not alerts:
        #     logger.info("All metrics within normal thresholds")
        logger.error("Metric collection not yet implemented")

    logger.info("Server Monitoring System shutting down")


if __name__ == "__main__":
    main()
