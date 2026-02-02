#!/usr/bin/env python3
"""
🎨 ASCII Artを美しいSVG画像に変換するスクリプト

機能:
- ASCII図を解析してSVG形式に変換
- 色付け、スタイリング、アニメーション対応
- 高解像度出力でプロフェッショナルな見た目
"""

import re
import xml.etree.ElementTree as ET
from typing import List, Tuple, Dict
import os
from pathlib import Path

class ASCIItoSVG:
    def __init__(self):
        self.char_width = 12
        self.char_height = 18
        self.colors = {
            'border': '#2563eb',      # Blue
            'fill': '#f8fafc',        # Light gray
            'text': '#1e293b',        # Dark gray  
            'accent': '#3b82f6',      # Bright blue
            'success': '#10b981',     # Green
            'warning': '#f59e0b',     # Orange
            'error': '#ef4444'        # Red
        }
    
    def parse_ascii_box(self, ascii_text: str) -> ET.Element:
        """ASCII ボックス図をSVGに変換"""
        lines = ascii_text.strip().split('\n')
        max_width = max(len(line) for line in lines) if lines else 0
        height = len(lines)
        
        # SVG要素を作成
        svg = ET.Element('svg', {
            'width': str(max_width * self.char_width + 40),
            'height': str(height * self.char_height + 40), 
            'xmlns': 'http://www.w3.org/2000/svg',
            'viewBox': f'0 0 {max_width * self.char_width + 40} {height * self.char_height + 40}'
        })
        
        # 背景
        bg = ET.SubElement(svg, 'rect', {
            'width': '100%',
            'height': '100%', 
            'fill': 'white',
            'stroke': 'none'
        })
        
        # グループ要素
        g = ET.SubElement(svg, 'g', {
            'transform': 'translate(20, 20)'
        })
        
        # テキスト要素を追加
        for y, line in enumerate(lines):
            text_elem = ET.SubElement(g, 'text', {
                'x': '0',
                'y': str((y + 1) * self.char_height),
                'font-family': 'Monaco, Consolas, monospace',
                'font-size': '14',
                'fill': self.colors['text']
            })
            text_elem.text = line
            
        return svg
    
    def create_architecture_diagram(self) -> ET.Element:
        """GitHub Test Dashboardのアーキテクチャ図を作成"""
        svg = ET.Element('svg', {
            'width': '800',
            'height': '600',
            'xmlns': 'http://www.w3.org/2000/svg',
            'viewBox': '0 0 800 600'
        })
        
        # スタイル定義
        defs = ET.SubElement(svg, 'defs')
        style = ET.SubElement(defs, 'style')
        style.text = '''
        .layer-box { fill: #f1f5f9; stroke: #334155; stroke-width: 2; rx: 8; }
        .component-box { fill: #e0f2fe; stroke: #0284c7; stroke-width: 1.5; rx: 4; }
        .title-text { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #1e293b; }
        .label-text { font-family: Arial, sans-serif; font-size: 12px; fill: #475569; }
        .arrow { stroke: #64748b; stroke-width: 2; marker-end: url(#arrowhead); }
        '''
        
        # 矢印マーカー
        marker = ET.SubElement(defs, 'marker', {
            'id': 'arrowhead',
            'markerWidth': '10',
            'markerHeight': '7', 
            'refX': '9',
            'refY': '3.5',
            'orient': 'auto'
        })
        polygon = ET.SubElement(marker, 'polygon', {
            'points': '0 0, 10 3.5, 0 7',
            'fill': '#64748b'
        })
        
        # フロントエンド層
        frontend_rect = ET.SubElement(svg, 'rect', {
            'class': 'layer-box',
            'x': '50', 'y': '50', 'width': '700', 'height': '120'
        })
        frontend_title = ET.SubElement(svg, 'text', {
            'class': 'title-text',
            'x': '400', 'y': '75', 'text-anchor': 'middle'
        })
        frontend_title.text = '🎨 React + TypeScript フロントエンド'
        
        # フロントエンドコンポーネント
        components_frontend = [
            ('📊 Dashboard', 100, 100),
            ('🎯 Test Suite', 250, 100),
            ('📈 Analytics', 400, 100),
            ('🔍 Test Runner', 550, 100)
        ]
        
        for label, x, y in components_frontend:
            rect = ET.SubElement(svg, 'rect', {
                'class': 'component-box',
                'x': str(x), 'y': str(y), 'width': '120', 'height': '40'
            })
            text = ET.SubElement(svg, 'text', {
                'class': 'label-text',
                'x': str(x + 60), 'y': str(y + 25), 'text-anchor': 'middle'
            })
            text.text = label
        
        # API層
        api_line = ET.SubElement(svg, 'line', {
            'class': 'arrow',
            'x1': '400', 'y1': '170', 'x2': '400', 'y2': '220'
        })
        api_text = ET.SubElement(svg, 'text', {
            'class': 'label-text',
            'x': '410', 'y': '195', 'text-anchor': 'start'
        })
        api_text.text = 'REST API'
        
        # バックエンド層
        backend_rect = ET.SubElement(svg, 'rect', {
            'class': 'layer-box',
            'x': '50', 'y': '230', 'width': '700', 'height': '120'
        })
        backend_title = ET.SubElement(svg, 'text', {
            'class': 'title-text',
            'x': '400', 'y': '255', 'text-anchor': 'middle'
        })
        backend_title.text = '⚙️ Node.js + Express バックエンド'
        
        # バックエンドコンポーネント
        components_backend = [
            ('🔗 GitHub API', 100, 280),
            ('📊 Analytics', 250, 280),
            ('📈 Reports', 400, 280),
            ('📦 WebSocket', 550, 280)
        ]
        
        for label, x, y in components_backend:
            rect = ET.SubElement(svg, 'rect', {
                'class': 'component-box',
                'x': str(x), 'y': str(y), 'width': '120', 'height': '40'
            })
            text = ET.SubElement(svg, 'text', {
                'class': 'label-text',
                'x': str(x + 60), 'y': str(y + 25), 'text-anchor': 'middle'
            })
            text.text = label
            
        # データベース層
        db_line = ET.SubElement(svg, 'line', {
            'class': 'arrow',
            'x1': '400', 'y1': '350', 'x2': '400', 'y2': '400'
        })
        
        db_rect = ET.SubElement(svg, 'rect', {
            'class': 'layer-box',
            'x': '50', 'y': '410', 'width': '700', 'height': '120'
        })
        db_title = ET.SubElement(svg, 'text', {
            'class': 'title-text',
            'x': '400', 'y': '435', 'text-anchor': 'middle'
        })
        db_title.text = '🗃️ SQLite / PostgreSQL データベース'
        
        # データベーステーブル
        tables = [
            ('Test Cases', 100, 460),
            ('Test Runs', 250, 460),
            ('Results', 400, 460),
            ('Metrics', 550, 460)
        ]
        
        for label, x, y in tables:
            rect = ET.SubElement(svg, 'rect', {
                'class': 'component-box',
                'x': str(x), 'y': str(y), 'width': '120', 'height': '40'
            })
            text = ET.SubElement(svg, 'text', {
                'class': 'label-text',
                'x': str(x + 60), 'y': str(y + 25), 'text-anchor': 'middle'
            })
            text.text = label
            
        return svg
    
    def save_svg(self, svg_element: ET.Element, filename: str):
        """SVGファイルを保存"""
        output_dir = Path('wiki/images')
        output_dir.mkdir(exist_ok=True)
        
        file_path = output_dir / f"{filename}.svg"
        
        # XMLヘッダーを追加
        rough_string = ET.tostring(svg_element, 'unicode')
        parsed = ET.XML(rough_string)
        ET.indent(parsed, space="  ", level=0)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
            f.write(ET.tostring(parsed, encoding='unicode'))
        
        print(f"✅ 保存完了: {file_path}")

def main():
    converter = ASCIItoSVG()
    
    # GitHub Test Dashboardアーキテクチャ図を生成
    arch_diagram = converter.create_architecture_diagram()
    converter.save_svg(arch_diagram, 'github-test-dashboard-architecture')
    
    print("""
🎉 SVG画像の生成が完了しました！

📁 生成されたファイル:
   - wiki/images/github-test-dashboard-architecture.svg

💡 使用方法:
![アーキテクチャ図](images/github-test-dashboard-architecture.svg)

🔄 次のステップ:
1. WikiのASCII artを画像参照に置き換え
2. スタイルやカラーリングを調整
3. より多くの図を生成
""")

if __name__ == "__main__":
    main()