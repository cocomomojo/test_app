#!/usr/bin/env python3
"""
🎨 追加のSVG画像を生成するスクリプト
Wiki17, 18用の図表を作成
"""

import xml.etree.ElementTree as ET
from pathlib import Path

def create_tool_comparison_matrix():
    """テスト管理ツールの比較マトリックス図を作成"""
    svg = ET.Element('svg', {
        'width': '900',
        'height': '600',
        'xmlns': 'http://www.w3.org/2000/svg',
        'viewBox': '0 0 900 600'
    })
    
    # スタイル定義
    defs = ET.SubElement(svg, 'defs')
    style = ET.SubElement(defs, 'style')
    style.text = '''
    .grid-line { stroke: #e2e8f0; stroke-width: 1; }
    .axis-line { stroke: #64748b; stroke-width: 2; }
    .axis-text { font-family: Arial, sans-serif; font-size: 14px; fill: #1e293b; font-weight: bold; }
    .tool-circle { stroke: #ffffff; stroke-width: 3; r: 20; }
    .tool-text { font-family: Arial, sans-serif; font-size: 12px; fill: #000000; text-anchor: middle; }
    .legend-text { font-family: Arial, sans-serif; font-size: 11px; fill: #475569; }
    '''
    
    # 背景
    bg = ET.SubElement(svg, 'rect', {
        'width': '100%', 'height': '100%', 'fill': 'white'
    })
    
    # グリッド線
    for i in range(1, 9):
        # 縦線
        line = ET.SubElement(svg, 'line', {
            'class': 'grid-line',
            'x1': str(100 + i * 75), 'y1': '100',
            'x2': str(100 + i * 75), 'y2': '500'
        })
        # 横線
        line = ET.SubElement(svg, 'line', {
            'class': 'grid-line',
            'x1': '100', 'y1': str(100 + i * 50),
            'x2': '700', 'y2': str(100 + i * 50)
        })
    
    # 軸
    # X軸
    x_axis = ET.SubElement(svg, 'line', {
        'class': 'axis-line',
        'x1': '100', 'y1': '500',
        'x2': '700', 'y2': '500'
    })
    # Y軸
    y_axis = ET.SubElement(svg, 'line', {
        'class': 'axis-line',
        'x1': '100', 'y1': '100',
        'x2': '100', 'y2': '500'
    })
    
    # 軸ラベル
    x_label = ET.SubElement(svg, 'text', {
        'class': 'axis-text',
        'x': '400', 'y': '540',
        'text-anchor': 'middle'
    })
    x_label.text = '💰 コスト (無料 → 高額)'
    
    y_label = ET.SubElement(svg, 'text', {
        'class': 'axis-text',
        'x': '50', 'y': '300',
        'text-anchor': 'middle',
        'transform': 'rotate(-90 50 300)'
    })
    y_label.text = '🚀 機能性 (基本 → 高機能)'
    
    # ツールのプロット
    tools = [
        ('GitHub Repository', 150, 450, '#10b981'),  # 左上（低コスト・高機能）
        ('Qase 無料', 200, 350, '#3b82f6'),
        ('TestLink', 180, 400, '#6b7280'),
        ('Notion Database', 250, 300, '#8b5cf6'),
        ('Qase 有料', 350, 200, '#3b82f6'),
        ('TestRail', 600, 150, '#f59e0b'),  # 右上（高コスト・高機能）
        ('Zephyr', 550, 180, '#ef4444'),
        ('Azure Test Plans', 500, 200, '#06b6d4')
    ]
    
    for name, x, y, color in tools:
        # ツールの円
        circle = ET.SubElement(svg, 'circle', {
            'class': 'tool-circle',
            'cx': str(x), 'cy': str(y),
            'fill': color,
            'opacity': '0.8'
        })
        
        # ツール名
        text = ET.SubElement(svg, 'text', {
            'class': 'tool-text',
            'x': str(x), 'y': str(y + 4)
        })
        text.text = name
    
    # 推奨エリアのハイライト
    highlight = ET.SubElement(svg, 'rect', {
        'x': '120', 'y': '120',
        'width': '200', 'height': '200',
        'fill': '#10b981',
        'opacity': '0.1',
        'stroke': '#10b981',
        'stroke-width': '2',
        'stroke-dasharray': '5,5'
    })
    
    highlight_label = ET.SubElement(svg, 'text', {
        'class': 'axis-text',
        'x': '220', 'y': '140',
        'text-anchor': 'middle',
        'fill': '#10b981'
    })
    highlight_label.text = '🏆 推奨エリア'
    
    # タイトル
    title = ET.SubElement(svg, 'text', {
        'class': 'axis-text',
        'x': '400', 'y': '40',
        'text-anchor': 'middle',
        'font-size': '18'
    })
    title.text = '📊 テスト管理ツール比較マトリックス (2026年版)'
    
    return svg

def create_qase_platform_overview():
    """Qaseプラットフォームの概要図を作成"""
    svg = ET.Element('svg', {
        'width': '800',
        'height': '500',
        'xmlns': 'http://www.w3.org/2000/svg',
        'viewBox': '0 0 800 500'
    })
    
    defs = ET.SubElement(svg, 'defs')
    style = ET.SubElement(defs, 'style')
    style.text = '''
    .platform-box { fill: #e0f2fe; stroke: #0284c7; stroke-width: 2; rx: 8; }
    .module-box { fill: #f0f9ff; stroke: #0369a1; stroke-width: 1.5; rx: 4; }
    .title-text { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #1e293b; }
    .subtitle-text { font-family: Arial, sans-serif; font-size: 12px; fill: #475569; }
    .connection-line { stroke: #64748b; stroke-width: 1; stroke-dasharray: 2,2; }
    '''
    
    # メインプラットフォーム
    main_box = ET.SubElement(svg, 'rect', {
        'class': 'platform-box',
        'x': '50', 'y': '80',
        'width': '700', 'height': '350'
    })
    
    # タイトル
    title = ET.SubElement(svg, 'text', {
        'class': 'title-text',
        'x': '400', 'y': '40',
        'text-anchor': 'middle'
    })
    title.text = '☁️ Qase Platform 構成要素'
    
    platform_title = ET.SubElement(svg, 'text', {
        'class': 'title-text',
        'x': '400', 'y': '110',
        'text-anchor': 'middle'
    })
    platform_title.text = '🏗️ クラウドベース テスト管理プラットフォーム'
    
    # 機能モジュール
    modules = [
        ('📝 テストケース\n管理', 100, 160, 120, 60),
        ('🔄 実行\n管理', 280, 160, 120, 60),
        ('📊 レポート\nダッシュ', 460, 160, 120, 60),
        ('🔗 統合\n機能', 640, 160, 120, 60),
        ('🗂️ リポジ\nトリ構造', 100, 280, 120, 60),
        ('⚡ 自動化\n実行', 280, 280, 120, 60),
        ('📈 分析\nツール', 460, 280, 120, 60),
        ('🔌 API\n連携', 640, 280, 120, 60)
    ]
    
    for text, x, y, w, h in modules:
        # モジュールボックス
        box = ET.SubElement(svg, 'rect', {
            'class': 'module-box',
            'x': str(x), 'y': str(y),
            'width': str(w), 'height': str(h)
        })
        
        # テキスト
        lines = text.split('\n')
        for i, line in enumerate(lines):
            text_elem = ET.SubElement(svg, 'text', {
                'class': 'subtitle-text',
                'x': str(x + w//2),
                'y': str(y + 25 + i * 15),
                'text-anchor': 'middle'
            })
            text_elem.text = line
    
    # 外部システム連携
    external_text = ET.SubElement(svg, 'text', {
        'class': 'subtitle-text',
        'x': '400', 'y': '460',
        'text-anchor': 'middle'
    })
    external_text.text = '🔄 GitHub, Jira, CI/CD パイプライン, Slack との連携'
    
    return svg

def save_svg(svg_element, filename):
    """SVGファイルを保存"""
    output_dir = Path('wiki/images')
    output_dir.mkdir(exist_ok=True)
    
    file_path = output_dir / f"{filename}.svg"
    
    rough_string = ET.tostring(svg_element, 'unicode')
    parsed = ET.XML(rough_string)
    ET.indent(parsed, space="  ", level=0)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write(ET.tostring(parsed, encoding='unicode'))
    
    print(f"✅ 保存完了: {file_path}")

def main():
    # ツール比較マトリックス図を生成
    matrix_diagram = create_tool_comparison_matrix()
    save_svg(matrix_diagram, 'tool-comparison-matrix')
    
    # Qaseプラットフォーム概要図を生成
    qase_diagram = create_qase_platform_overview()
    save_svg(qase_diagram, 'qase-platform-overview')
    
    print("""
🎉 追加のSVG画像生成が完了しました！

📁 生成されたファイル:
   - wiki/images/tool-comparison-matrix.svg
   - wiki/images/qase-platform-overview.svg

💡 使用方法:
![ツール比較マトリックス](images/tool-comparison-matrix.svg)
![Qaseプラットフォーム概要](images/qase-platform-overview.svg)
""")

if __name__ == "__main__":
    main()