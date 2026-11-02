"""Order-architecture sheet. Does not rewrite platform or service forecast formulas."""

from __future__ import annotations

from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName

NAVY = "1F4E79"
YELLOW = "FFF2CC"
HEADER_FILL = PatternFill("solid", fgColor=NAVY)
HEADER_FONT = Font(name="Calibri", size=11, color="FFFFFF", bold=True)
SECTION_FONT = Font(name="Calibri", size=12, bold=True, color=NAVY)
BLUE_FONT = Font(name="Calibri", size=11, color="1F4E79", bold=True)
INPUT_FILL = PatternFill("solid", fgColor=YELLOW)
THIN = Border(
    left=Side(style="thin", color="D9D9D9"),
    right=Side(style="thin", color="D9D9D9"),
    top=Side(style="thin", color="D9D9D9"),
    bottom=Side(style="thin", color="D9D9D9"),
)
WRAP = Alignment(wrap_text=True, vertical="center")


def add_offer_architecture(wb) -> None:
    ws = wb.create_sheet("OfferArchitecture")
    ws["A1"] = "Commercial architecture — one order, separate lines. Not an approved price."
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:G1")
    ws["A2"] = (
        "Added 2 November 2026 (Australia/Brisbane). Prices are exclusive of GST until registration is confirmed. "
        "Yellow cells are the order being tested. The scenario table uses the same rates. "
        "Platform COGS per entity-month is the reclassified figure on MarginMix (infrastructure, model, support), not a second success manager. "
        "Managed-intelligence hours are not added again as platform founder time."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:G4")

    inputs = [
        (6, "arch_entities", 1, "0", "Operating entities on the platform"),
        (7, "arch_enterprise_terms", 0, "0", "1 = customer requires the enterprise contractual set. Does not by itself raise a single-entity order to the floor."),
        (8, "arch_floor", 15000, '"$"#,##0', "Proposed monthly platform floor. Applied only when enterprise terms are required and the rate card is below this."),
        (9, "arch_mi", 2, "0", "0 none, 1 Essential, 2 Advanced, 3 Strategic. 2 matches the architecture draft's preferred start. It does not change ServiceForecast36."),
        (10, "arch_onboarding_fee", 0, '"$"#,##0', "Cash charged for standard activation. 0 means included and still costed."),
        (11, "arch_onboarding_hours", 12, "0", "Cap. Hours beyond this are not included."),
        (12, "arch_pilot", 0, "0", "0 none, 1 design partner at zero fee, 2 paid pilot."),
        (13, "arch_pilot_fee", 15000, '"$"#,##0', "Paid pilot fee. Credited to year-1 platform invoice when arch_pilot is 2. Not extra revenue."),
        (14, "arch_pilot_hours", 15, "0", "Design-partner and paid-pilot delivery cap."),
    ]
    ws["A5"] = "Order inputs"
    ws["A5"].font = SECTION_FONT
    for row, name, value, fmt, note in inputs:
        ws.cell(row, 1, name)
        cell = ws.cell(row, 2, value)
        cell.fill = INPUT_FILL
        cell.font = BLUE_FONT
        cell.number_format = fmt
        cell.border = THIN
        ws.cell(row, 3, note).alignment = WRAP
        wb.defined_names.add(DefinedName(name, attr_text=f"OfferArchitecture!$B${row}"))
        ws.row_dimensions[row].height = 22

    # Worked order
    ws["A16"] = "This order"
    ws["A16"].font = SECTION_FONT
    rows = [
        (17, "Rate-card platform monthly", "=list_mrr+MAX(0,arch_entities-1)*second_entity_mrr"),
        (18, "Floor applies?", '=IF(AND(arch_enterprise_terms>=1,B17<arch_floor),"Yes","No")'),
        (19, "Platform monthly invoiced", "=IF(AND(arch_enterprise_terms>=1,B17<arch_floor),arch_floor,B17)"),
        (20, "Annual platform invoice (11 months)", "=B19*annual_months_paid"),
        (21, "Managed intelligence monthly", "=IF(arch_mi=1,svc_essential_price,IF(arch_mi=2,svc_advanced_price,IF(arch_mi=3,svc_strategic_price,0)))"),
        (22, "Managed intelligence hours / month", "=IF(arch_mi=1,svc_essential_hours,IF(arch_mi=2,svc_advanced_hours,IF(arch_mi=3,svc_strategic_hours,0)))"),
        (23, "Annual managed intelligence (12 months, no free month)", "=B21*12"),
        (24, "Activation fee", "=arch_onboarding_fee"),
        (25, "Pilot fee recognised as its own revenue", '=IF(arch_pilot=2,0,IF(arch_pilot=1,0,0))'),
        (26, "Pilot credited against the platform invoice", "=IF(arch_pilot=2,MIN(arch_pilot_fee,B20),0)"),
        (27, "Year-1 cash collected", "=B20-B26+B23+B24+IF(arch_pilot=2,arch_pilot_fee,0)"),
        (28, "Of which is platform after credit", "=B20-B26"),
        (29, "Platform direct cost, year", "=MarginMix!B14*12*arch_entities"),
        (30, "Activation cost at founder rate", "=arch_onboarding_hours*founder_opp_per_hour"),
        (31, "Pilot cost at founder rate", "=IF(arch_pilot>=1,arch_pilot_hours*founder_opp_per_hour,0)"),
        (32, "Service cost, founder delivers", "=B22*founder_opp_per_hour*12"),
        (33, "Service cost, specialist at full-book rate", "=B22*svc_hour_cost*12"),
        (34, "Year-1 loaded margin, founder delivers the service", "=IF(B27=0,NA(),(B27-B29-B30-B31-B32)/B27)"),
        (35, "Year-1 loaded margin, specialist full book", "=IF(B27=0,NA(),(B27-B29-B30-B31-B33)/B27)"),
        (36, "Activation component margin", "=IF(B24=0,\"Included, cost only\",(B24-B30)/B24)"),
    ]
    for row, label, formula in rows:
        ws.cell(row, 1, label).alignment = WRAP
        cell = ws.cell(row, 2, formula)
        cell.border = THIN
        if row in {18, 36}:
            cell.alignment = Alignment(horizontal="left")
        elif row in {34, 35}:
            cell.number_format = "0.0%"
        elif row == 22:
            cell.number_format = "0.0"
        else:
            cell.number_format = '"$"#,##0'
        ws.row_dimensions[row].height = 18
    ws["B36"].number_format = "0.0%"

    ws["A38"] = (
        "Year-1 cash collected counts a paid pilot as cash in, and the credit as a reduction of the platform invoice, so the pilot is not revenue twice. "
        "A zero activation fee still carries activation cost. That cost is inside the year-1 margin. "
        "Founder-delivered Advanced on a single entity is the case that falls through 80%. A full specialist book does not."
    )
    ws["A38"].alignment = WRAP
    ws.merge_cells("A38:G40")

    ws["A42"] = "Standard configurations"
    ws["A42"].font = SECTION_FONT
    headers = [
        "Configuration",
        "Entities",
        "Enterprise terms",
        "Service code",
        "Rate card monthly",
        "Invoiced monthly",
        "Floor binds",
        "Annual platform",
        "Annual service",
        "Year-1 revenue ex pilot",
        "Founder-delivered margin",
        "Specialist full-book margin",
    ]
    for i, h in enumerate(headers, 1):
        ws.cell(43, i, h)
        ws.cell(43, i).fill = HEADER_FILL
        ws.cell(43, i).font = HEADER_FONT
        ws.cell(43, i).alignment = WRAP
    configs = [
        ("Single entity, platform only", 1, 0, 0),
        ("Single entity + Essential", 1, 0, 1),
        ("Single entity + Advanced", 1, 0, 2),
        ("Single entity + Strategic", 1, 0, 3),
        ("Two entities, platform only", 2, 0, 0),
        ("Two entities + Advanced, no floor", 2, 0, 2),
        ("Two entities + Advanced, enterprise terms", 2, 1, 2),
        ("Three entities, platform only", 3, 0, 0),
    ]
    for i, (label, entities, terms, code) in enumerate(configs):
        r = 44 + i
        ws.cell(r, 1, label)
        ws.cell(r, 2, entities)
        ws.cell(r, 3, terms)
        ws.cell(r, 4, code)
        ws.cell(r, 5, f"=list_mrr+MAX(0,B{r}-1)*second_entity_mrr").number_format = '"$"#,##0'
        ws.cell(r, 6, f"=IF(AND(C{r}>=1,E{r}<arch_floor),arch_floor,E{r})").number_format = '"$"#,##0'
        ws.cell(r, 7, f'=IF(AND(C{r}>=1,E{r}<arch_floor),"Yes","No")')
        ws.cell(r, 8, f"=F{r}*annual_months_paid").number_format = '"$"#,##0'
        ws.cell(
            r,
            9,
            f"=IF(D{r}=1,svc_essential_price,IF(D{r}=2,svc_advanced_price,IF(D{r}=3,svc_strategic_price,0)))*12",
        ).number_format = '"$"#,##0'
        ws.cell(r, 10, f"=H{r}+I{r}+arch_onboarding_fee").number_format = '"$"#,##0'
        hours = f"IF(D{r}=1,svc_essential_hours,IF(D{r}=2,svc_advanced_hours,IF(D{r}=3,svc_strategic_hours,0)))"
        base_cost = f"MarginMix!B14*12*B{r}+arch_onboarding_hours*founder_opp_per_hour"
        ws.cell(r, 11, f"=IF(J{r}=0,NA(),(J{r}-({base_cost}+({hours})*founder_opp_per_hour*12))/J{r})").number_format = "0.0%"
        ws.cell(r, 12, f"=IF(J{r}=0,NA(),(J{r}-({base_cost}+({hours})*svc_hour_cost*12))/J{r})").number_format = "0.0%"
        for c in range(1, 13):
            ws.cell(r, c).border = THIN
            ws.cell(r, c).alignment = WRAP
        ws.row_dimensions[r].height = 22

    ws.column_dimensions["A"].width = 62
    ws.column_dimensions["B"].width = 22
    ws.column_dimensions["C"].width = 78
    for col in range(4, 13):
        ws.column_dimensions[get_column_letter(col)].width = 24
    ws.row_dimensions[43].height = 32
    ws.freeze_panes = "A44"
    ws.sheet_properties.tabColor = "1F4E79"
    ws.auto_filter.ref = "A43:L51"
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToPage = True
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.sheet_view.showGridLines = False
    ws.oddHeader.left.text = "ExecutiveOS  |  Offer architecture  |  Not an approved decision"
    ws.oddFooter.left.text = "Braltiq  |  Confidential working model"
    ws.oddFooter.right.text = "Page &P of &N"
