#!/bin/bash
# =============================================================================
# Server Monitoring Script — Foundations Capstone Project
# =============================================================================
# Collects system metrics (CPU, memory, disk, network) and outputs structured
# JSON. Designed to be run manually or via cron.
#
# Usage:
#   ./monitor.sh              # Print metrics to stdout
#   ./monitor.sh --save       # Print metrics and save to metrics/ directory
#
# Dependencies: bash 5+, coreutils, procps (optional: sysstat, jq)
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
METRICS_DIR="${SCRIPT_DIR}/metrics"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
FILENAME_TS="$(date -u +"%Y-%m-%d-%H%M%S")"
HOSTNAME="$(hostname)"
SAVE_TO_FILE=false

# Parse arguments
for arg in "$@"; do
    case "$arg" in
        --save) SAVE_TO_FILE=true ;;
        --help)
            echo "Usage: $0 [--save] [--help]"
            echo "  --save   Save output to metrics/ directory"
            echo "  --help   Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown argument: $arg" >&2
            exit 1
            ;;
    esac
done

# Ensure metrics directory exists
mkdir -p "${METRICS_DIR}"

# ---------------------------------------------------------------------------
# Helper: Check if a command is available
# ---------------------------------------------------------------------------
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ---------------------------------------------------------------------------
# TODO: Implement check_cpu
# ---------------------------------------------------------------------------
# Collect CPU usage percentage.
#
# Approaches (pick one):
#   1. Read /proc/stat twice with a 1-second interval and calculate delta.
#   2. Use `top -bn1` and parse the %Cpu line.
#   3. Use `mpstat` from the sysstat package.
#
# Must output a JSON object:
#   {
#     "metric": "cpu",
#     "value": <float>,
#     "unit": "percent",
#     "timestamp": "<ISO 8601 UTC>"
#   }
#
# If the required tool is not available, output:
#   {
#     "metric": "cpu",
#     "status": "error",
#     "message": "<reason>",
#     "timestamp": "<ISO 8601 UTC>"
#   }
# ---------------------------------------------------------------------------
check_cpu() {
    # TODO: Implement this function
    echo "TODO: implement check_cpu" >&2
    cat <<EOF
{
    "metric": "cpu",
    "status": "not_implemented",
    "timestamp": "${TIMESTAMP}"
}
EOF
}

# ---------------------------------------------------------------------------
# TODO: Implement check_memory
# ---------------------------------------------------------------------------
# Collect memory usage using `free` or /proc/meminfo.
#
# Must output a JSON object:
#   {
#     "metric": "memory",
#     "total_mb": <int>,
#     "used_mb": <int>,
#     "available_mb": <int>,
#     "percent": <float>,
#     "timestamp": "<ISO 8601 UTC>"
#   }
# ---------------------------------------------------------------------------
check_memory() {
    # TODO: Implement this function
    echo "TODO: implement check_memory" >&2
    cat <<EOF
{
    "metric": "memory",
    "status": "not_implemented",
    "timestamp": "${TIMESTAMP}"
}
EOF
}

# ---------------------------------------------------------------------------
# TODO: Implement check_disk
# ---------------------------------------------------------------------------
# Collect disk usage using `df`.
#
# Must output a JSON object:
#   {
#     "metric": "disk",
#     "filesystems": [
#       {
#         "mount": "/",
#         "total_gb": <float>,
#         "used_gb": <float>,
#         "available_gb": <float>,
#         "percent": <float>
#       }
#     ],
#     "timestamp": "<ISO 8601 UTC>"
#   }
#
# Hint: Use `df -B1` for byte-level output and convert to GB.
#       Filter out tmpfs and other pseudo-filesystems.
# ---------------------------------------------------------------------------
check_disk() {
    # TODO: Implement this function
    echo "TODO: implement check_disk" >&2
    cat <<EOF
{
    "metric": "disk",
    "status": "not_implemented",
    "timestamp": "${TIMESTAMP}"
}
EOF
}

# ---------------------------------------------------------------------------
# TODO: Implement check_network
# ---------------------------------------------------------------------------
# Collect network statistics from /proc/net/dev or using `ip`/`ss`.
#
# Must output a JSON object:
#   {
#     "metric": "network",
#     "interfaces": [
#       {
#         "name": "eth0",
#         "rx_bytes": <int>,
#         "tx_bytes": <int>
#       }
#     ],
#     "connections": <int>,
#     "timestamp": "<ISO 8601 UTC>"
#   }
#
# Hint: Read /proc/net/dev and skip the header lines.
#       Use `ss -tun | wc -l` for connection count.
# ---------------------------------------------------------------------------
check_network() {
    # TODO: Implement this function
    echo "TODO: implement check_network" >&2
    cat <<EOF
{
    "metric": "network",
    "status": "not_implemented",
    "timestamp": "${TIMESTAMP}"
}
EOF
}

# ---------------------------------------------------------------------------
# TODO: Combine all metrics into a single JSON document
# ---------------------------------------------------------------------------
# The final output must have this structure:
#   {
#     "hostname": "<hostname>",
#     "collected_at": "<ISO 8601 UTC>",
#     "metrics": {
#       "cpu": { ... },
#       "memory": { ... },
#       "disk": { ... },
#       "network": { ... }
#     }
#   }
#
# Hint: Capture each function's output into a variable and assemble them.
#       If jq is available, use it to combine and format. Otherwise, build
#       the JSON string manually.
# ---------------------------------------------------------------------------
collect_all() {
    local cpu_json memory_json disk_json network_json

    cpu_json="$(check_cpu)"
    memory_json="$(check_memory)"
    disk_json="$(check_disk)"
    network_json="$(check_network)"

    # TODO: Assemble the combined JSON document
    # For now, output a skeleton structure
    cat <<EOF
{
    "hostname": "${HOSTNAME}",
    "collected_at": "${TIMESTAMP}",
    "metrics": {
        "cpu": ${cpu_json},
        "memory": ${memory_json},
        "disk": ${disk_json},
        "network": ${network_json}
    }
}
EOF
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
    local output
    output="$(collect_all)"

    # Print to stdout
    echo "${output}"

    # Optionally save to file
    if [[ "${SAVE_TO_FILE}" == "true" ]]; then
        local filepath="${METRICS_DIR}/metric-${FILENAME_TS}.json"
        echo "${output}" > "${filepath}"
        echo "Metrics saved to ${filepath}" >&2
    fi
}

main "$@"
