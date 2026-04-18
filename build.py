#!/usr/bin/env python3
"""Regenerates the carousel and browse sections of index.html from stories.json.

Usage:
    python build.py

Add a new story by editing stories.json, then run this script.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
STORIES_FILE = ROOT / "stories.json"
INDEX_FILE = ROOT / "index.html"


def build_carousel(stories):
    lines = []
    for s in stories:
        lines.append(f'        <a href="{s["url"]}" class="slide slide-{s["cssClass"]}">')
        lines.append(f'            <div class="slide-bg"></div>')
        lines.append(f'            <div class="slide-image" style="background-image: url(\'{s["ogImage"]}\')"></div>')
        lines.append(f'            <div class="slide-overlay"></div>')
        lines.append(f'            <div class="slide-content">')
        lines.append(f'                <div class="slide-period">{s["period"]}</div>')
        lines.append(f'                <div class="slide-title">{s["title"]}</div>')
        lines.append(f'                <div class="slide-location">{s["location"]}</div>')
        lines.append(f'                <div class="slide-hook">{s["hook"]}</div>')
        lines.append(f'                <span class="slide-cta">Read this story</span>')
        lines.append(f'            </div>')
        lines.append(f'        </a>')
        lines.append('')
    return '\n'.join(lines)


def build_browse(themes, stories):
    stories_by_theme = {}
    for s in stories:
        stories_by_theme.setdefault(s["theme"], []).append(s)

    lines = []
    for theme in themes:
        tid = theme["id"]
        lines.append(f'    <div class="theme-group" data-theme="{tid}">')
        lines.append(f'        <div class="theme-toggle">')
        lines.append(f'            <div class="theme-toggle-text">')
        lines.append(f'                <span class="theme-name">{theme["name"]}</span>')
        lines.append(f'                <div class="theme-description">{theme["description"]}</div>')
        lines.append(f'            </div>')
        lines.append(f'            <span class="theme-arrow">&#9656;</span>')
        lines.append(f'        </div>')
        lines.append(f'        <div class="theme-cards">')

        theme_stories = stories_by_theme.get(tid, [])
        if theme_stories:
            for s in theme_stories:
                lines.append(f'            <a href="{s["url"]}" class="card card-{s["cssClass"]}">')
                lines.append(f'                <div class="card-bg"></div>')
                lines.append(f'                <div class="card-image" style="background-image: url(\'{s["ogImage"]}\')"></div>')
                lines.append(f'                <div class="card-overlay"></div>')
                lines.append(f'                <div class="card-content">')
                lines.append(f'                    <div class="card-period">{s["period"]}</div>')
                lines.append(f'                    <div class="card-title">{s["title"]}</div>')
                lines.append(f'                    <div class="card-location">{s["location"]}</div>')
                lines.append(f'                    <div class="card-hook">{s["hook"]}</div>')
                lines.append(f'                </div>')
                lines.append(f'            </a>')
        else:
            lines.append(f'            <p style="color: var(--text-muted); font-style: italic; padding: 10px 0;">Coming</p>')

        lines.append(f'        </div>')
        lines.append(f'    </div>')
        lines.append('')

    return '\n'.join(lines)


def replace_section(html, marker, new_content):
    start_marker = f'<!-- {marker}:START -->'
    end_marker = f'<!-- {marker}:END -->'
    pattern = re.compile(
        re.escape(start_marker) + r'.*?' + re.escape(end_marker),
        re.DOTALL
    )
    replacement = f'{start_marker}\n{new_content}\n{end_marker}'
    result, count = pattern.subn(replacement, html)
    if count == 0:
        print(f"ERROR: markers not found in index.html: {start_marker}", file=sys.stderr)
        sys.exit(1)
    return result


def main():
    data = json.loads(STORIES_FILE.read_text(encoding='utf-8'))
    html = INDEX_FILE.read_text(encoding='utf-8')

    carousel_html = build_carousel(data['stories'])
    browse_html = build_browse(data['themes'], data['stories'])

    html = replace_section(html, 'STORIES:CAROUSEL', carousel_html)
    html = replace_section(html, 'STORIES:BROWSE', browse_html)

    INDEX_FILE.write_text(html, encoding='utf-8')
    print(f"Done. index.html updated with {len(data['stories'])} stories.")


if __name__ == '__main__':
    main()
