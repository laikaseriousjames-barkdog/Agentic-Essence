#!/usr/bin/env python3
"""Main entry point for Agentic Essence Desktop."""
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from launcher import launch_desktop

if __name__ == "__main__":
    is_server_only = "--server-only" in sys.argv or "--headless" in sys.argv
    launch_desktop(server_only=is_server_only)
