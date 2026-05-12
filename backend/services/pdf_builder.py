import os
import uuid
from typing import List, Dict
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfgen import canvas
import re

GENERATED_DIR = "generated"
os.makedirs(GENERATED_DIR, exist_ok=True)

# Color palette
PRIMARY = HexColor("#6C63FF")
SECONDARY = HexColor("#F0EFFE")
ACCENT = HexColor("#FF6584")
DARK = HexColor("#1A1A2E")
GRAY = HexColor("#6B7280")
LIGHT_GRAY = HexColor("#F3F4F6")
TABLE_HEADER = HexColor("#4F46E5")
TABLE_ROW1 = HexColor("#EEF2FF")
TABLE_ROW2 = HexColor("#FFFFFF")
SUCCESS = HexColor("#10B981")
WARNING = HexColor("#F59E0B")

SECTION_COLORS = {
    "summary": HexColor("#6C63FF"),
    "key_concepts": HexColor("#10B981"),
    "flowchart": HexColor("#F59E0B"),
    "comparison": HexColor("#EF4444"),
    "qa": HexColor("#8B5CF6"),
    "timeline": HexColor("#06B6D4"),
}

SECTION_LABELS = {
    "summary": "📋 Summary",
    "key_concepts": "🔑 Key Concepts",
    "flowchart": "🔄 Process Flows",
    "comparison": "⚖️ Comparisons",
    "qa": "❓ Q&A Practice",
    "timeline": "📅 Timeline",
}


def number_pages(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont("Helvetica", 9)
    canvas_obj.setFillColor(GRAY)
    page_num = canvas_obj.getPageNumber()
    canvas_obj.drawCentredString(A4[0] / 2, 0.5 * inch, f"— {page_num} —")
    canvas_obj.restoreState()


def parse_markdown_to_flowables(text: str, styles: dict) -> list:
    """Convert markdown-like text to ReportLab flowables."""
    flowables = []
    lines = text.split("\n")
    i = 0

    # Detect tables
    table_lines = []
    in_table = False

    while i < len(lines):
        line = lines[i].rstrip()

        # Table detection
        if "|" in line and line.strip().startswith("|"):
            table_lines.append(line)
            i += 1
            continue
        else:
            if table_lines:
                flowables.extend(build_table(table_lines, styles))
                table_lines = []

        stripped = line.strip()

        if not stripped:
            flowables.append(Spacer(1, 6))
            i += 1
            continue

        # Headings
        if stripped.startswith("### "):
            text_content = stripped[4:].strip()
            flowables.append(Spacer(1, 4))
            flowables.append(Paragraph(text_content, styles["h3"]))
        elif stripped.startswith("## "):
            text_content = stripped[3:].strip()
            flowables.append(Spacer(1, 8))
            flowables.append(Paragraph(text_content, styles["h2"]))
        elif stripped.startswith("# "):
            text_content = stripped[2:].strip()
            flowables.append(Spacer(1, 10))
            flowables.append(Paragraph(text_content, styles["h1"]))
        # Bullet points
        elif stripped.startswith("- ") or stripped.startswith("* "):
            text_content = inline_md(stripped[2:])
            flowables.append(Paragraph(f"• {text_content}", styles["bullet"]))
        # Numbered list
        elif re.match(r"^\d+\. ", stripped):
            text_content = inline_md(re.sub(r"^\d+\. ", "", stripped))
            num = re.match(r"^(\d+)\. ", stripped).group(1)
            flowables.append(Paragraph(f"{num}. {text_content}", styles["bullet"]))
        # Q&A pattern
        elif stripped.startswith("Q:"):
            flowables.append(Spacer(1, 6))
            flowables.append(Paragraph(inline_md(stripped), styles["question"]))
        elif stripped.startswith("A:"):
            flowables.append(Paragraph(inline_md(stripped), styles["answer"]))
        # Process/flow arrows
        elif "→" in stripped or "->" in stripped:
            flowables.append(Paragraph(stripped, styles["flow_step"]))
        # Bold line
        elif stripped.startswith("**") and stripped.endswith("**"):
            flowables.append(Paragraph(inline_md(stripped), styles["bold_line"]))
        else:
            flowables.append(Paragraph(inline_md(stripped), styles["body"]))

        i += 1

    if table_lines:
        flowables.extend(build_table(table_lines, styles))

    return flowables


def inline_md(text: str) -> str:
    """Convert inline markdown bold/italic to ReportLab XML."""
    # Bold+italic
    text = re.sub(r'\*\*\*(.*?)\*\*\*', r'<b><i>\1</i></b>', text)
    # Bold
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    # Italic
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    # Code
    text = re.sub(r'`(.*?)`', r'<font name="Courier">\1</font>', text)
    # Escape raw & and < that aren't part of our tags
    # (simple approach - already processed tags above)
    return text


def build_table(table_lines: list, styles: dict) -> list:
    """Parse markdown table lines into ReportLab Table."""
    rows = []
    for line in table_lines:
        if re.match(r"^\|[-| :]+\|$", line.strip()):
            continue  # separator row
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        rows.append(cells)

    if not rows:
        return []

    if len(rows) < 1:
        return []

    # Max cells
    max_cols = max(len(r) for r in rows)
    for r in rows:
        while len(r) < max_cols:
            r.append("")

    table_data = []
    for i, row in enumerate(rows):
        if i == 0:
            table_data.append([Paragraph(f"<b>{c}</b>", styles["table_header"]) for c in row])
        else:
            table_data.append([Paragraph(c, styles["table_cell"]) for c in row])

    col_width = (A4[0] - 2.5 * inch) / max(max_cols, 1)
    table = Table(table_data, colWidths=[col_width] * max_cols, repeatRows=1)

    table_style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [TABLE_ROW1, TABLE_ROW2]),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("TOPPADDING", (0, 1), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#E5E7EB")),
        ("ROUNDEDCORNERS", [4, 4, 4, 4]),
    ])
    table.setStyle(table_style)
    return [Spacer(1, 8), table, Spacer(1, 8)]


async def build_pdf(ai_content: dict, title: str, book_title: str, options: List[str]) -> str:
    filename = f"{uuid.uuid4()}.pdf"
    filepath = os.path.join(GENERATED_DIR, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        rightMargin=1.2 * inch,
        leftMargin=1.2 * inch,
        topMargin=1.2 * inch,
        bottomMargin=1.0 * inch,
    )

    base_styles = getSampleStyleSheet()

    styles = {
        "cover_title": ParagraphStyle("cover_title", fontName="Helvetica-Bold", fontSize=32, textColor=white, alignment=TA_CENTER, spaceAfter=12),
        "cover_sub": ParagraphStyle("cover_sub", fontName="Helvetica", fontSize=16, textColor=HexColor("#C7D2FE"), alignment=TA_CENTER, spaceAfter=8),
        "section_title": ParagraphStyle("section_title", fontName="Helvetica-Bold", fontSize=18, textColor=white, alignment=TA_LEFT, spaceAfter=4),
        "h1": ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=15, textColor=DARK, spaceBefore=10, spaceAfter=6),
        "h2": ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=13, textColor=PRIMARY, spaceBefore=8, spaceAfter=4),
        "h3": ParagraphStyle("h3", fontName="Helvetica-BoldOblique", fontSize=11, textColor=HexColor("#4F46E5"), spaceBefore=6, spaceAfter=3),
        "body": ParagraphStyle("body", fontName="Helvetica", fontSize=10, textColor=DARK, leading=16, spaceBefore=2, spaceAfter=2, alignment=TA_JUSTIFY),
        "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=10, textColor=DARK, leading=15, leftIndent=16, spaceBefore=2, spaceAfter=2),
        "bold_line": ParagraphStyle("bold_line", fontName="Helvetica-Bold", fontSize=10, textColor=DARK, spaceBefore=4, spaceAfter=2),
        "question": ParagraphStyle("question", fontName="Helvetica-Bold", fontSize=10, textColor=HexColor("#4F46E5"), leading=15, spaceBefore=8, spaceAfter=2),
        "answer": ParagraphStyle("answer", fontName="Helvetica", fontSize=10, textColor=DARK, leading=15, leftIndent=12, spaceAfter=4),
        "flow_step": ParagraphStyle("flow_step", fontName="Courier", fontSize=9, textColor=HexColor("#374151"), leading=14, backColor=HexColor("#F9FAFB"), leftIndent=8, spaceBefore=2, spaceAfter=2),
        "table_header": ParagraphStyle("table_header", fontName="Helvetica-Bold", fontSize=9, textColor=white),
        "table_cell": ParagraphStyle("table_cell", fontName="Helvetica", fontSize=9, textColor=DARK),
    }

    story = []

    # === COVER PAGE ===
    from reportlab.platypus import Frame
    cover_bg = Table(
        [[Paragraph(f'<b>{title}</b>', styles["cover_title"])]],
        colWidths=[A4[0] - 2.4 * inch],
        rowHeights=[120],
    )
    cover_bg.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PRIMARY),
        ("ROUNDEDCORNERS", [12, 12, 12, 12]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 30),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 30),
    ]))

    story.append(Spacer(1, 0.8 * inch))
    story.append(cover_bg)
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(f"Study Booklet — {book_title}", styles["cover_sub"]))
    story.append(Spacer(1, 0.15 * inch))

    # TOC
    toc_data = [["Contents", ""]]
    for opt in options:
        if opt in ai_content:
            toc_data.append([SECTION_LABELS.get(opt, opt), ""])

    toc = Table(toc_data, colWidths=[3.5 * inch, 0.5 * inch])
    toc.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1A1A2E")),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 11),
        ("FONTSIZE", (0, 1), (-1, -1), 10),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("TEXTCOLOR", (0, 1), (-1, -1), DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [SECONDARY, white]),
        ("BOX", (0, 0), (-1, -1), 1, HexColor("#E5E7EB")),
    ]))
    story.append(toc)
    story.append(PageBreak())

    # === SECTIONS ===
    for opt in options:
        if opt not in ai_content:
            continue

        section_color = SECTION_COLORS.get(opt, PRIMARY)
        section_label = SECTION_LABELS.get(opt, opt.replace("_", " ").title())

        # Section header band
        header_table = Table(
            [[Paragraph(section_label, styles["section_title"])]],
            colWidths=[A4[0] - 2.4 * inch],
            rowHeights=[52],
        )
        header_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), section_color),
            ("ROUNDEDCORNERS", [8, 8, 8, 8]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 20),
            ("TOPPADDING", (0, 0), (-1, -1), 14),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ]))

        story.append(KeepTogether([header_table, Spacer(1, 14)]))

        # Section content
        section_text = ai_content[opt]
        content_flowables = parse_markdown_to_flowables(section_text, styles)
        story.extend(content_flowables)

        story.append(Spacer(1, 20))
        story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#E5E7EB")))
        story.append(PageBreak())

    doc.build(story, onFirstPage=number_pages, onLaterPages=number_pages)
    return filepath
