"""Order-architecture sheet. Does not rewrite platform or service forecast formulas.

Reconciliation of 2 November 2026:
- Founder-led default service is Essential (arch_mi = 1). Advanced is not the default.
- The floor binds only for a multi-entity order with material governance, and only when the rate card is below the floor.
- A routine security questionnaire does not bind the floor. The superseded trigger is preserved on its own row.
- Year-1 cost uses PlatformCost fully loaded figures. The 2 November partial-cost margin stays in its own column.
- Activation is a separate once-only cost. It is not inside the monthly platform cost.
"""

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
AUD = '"$"#,##0'
PCT = "0.0%"


def add_offer_architecture(wb) -> None:
    ws = wb.create_sheet("OfferArchitecture")
    ws["A1"] = "Commercial architecture — one order, separate lines. Not an approved price."
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:G1")
    ws["A2"] = (
        "Reconciled 2 November 2026 (Australia/Brisbane). Prices are exclusive of GST. GST is added on the invoice where it applies. "
        "Registration and place of supply are not in the repository. "
        "Yellow cells are the order being tested. "
        "Essential is the default while the founder delivers the service. Advanced is the preferred enterprise offer only once specialist capacity is funded. "
        "The floor does not rise because someone asks for a routine security questionnaire. "
        "Platform cost for the margin rows is the fully loaded account cost on PlatformCost. "
        "The older partial cost (MarginMix reclassified, about $96 an entity at 25 logos) is kept only as a comparison."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:G4")

    inputs = [
        (6, "arch_entities", 1, "0", "Operating entities on the platform."),
        (
            7,
            "arch_governance",
            0,
            "0",
            "0 standard terms. 1 routine security questionnaire only. 2 material enterprise governance. Only 2 can bind the floor, and only with two or more entities.",
        ),
        (
            8,
            "arch_enterprise_terms",
            0,
            "0",
            "SUPERSEDED 2 November 2026. The first architecture draft treated any enterprise-terms flag as the floor trigger. The floor formula no longer reads this cell.",
        ),
        (9, "arch_floor", 15000, AUD, "Proposed monthly platform floor. Not an approved price."),
        (
            10,
            "arch_mi",
            1,
            "0",
            "0 none, 1 Essential, 2 Advanced, 3 Strategic. Default 1 is the founder-led offer. Does not change ServiceForecast36 attach rates.",
        ),
        (11, "arch_onboarding_fee", 0, AUD, "Cash charged for standard activation. Zero means the line is printed and the cost is internal."),
        (12, "arch_onboarding_hours", 12, "0", "Activation cap. Counted once in year-1 cost. Not inside monthly platform cost."),
        (13, "arch_pilot", 0, "0", "0 none, 1 design partner at zero fee, 2 paid pilot."),
        (
            14,
            "arch_pilot_fee",
            15000,
            AUD,
            "Paid pilot. Assumptions!pilot_fee remains the earlier 12000 hypothesis and is not read here.",
        ),
        (15, "arch_pilot_hours", 15, "0", "Pilot delivery cap. Separate from the 12 activation hours."),
        (
            16,
            "arch_pilot_converts",
            0,
            "0",
            "1 = the customer signs the platform within 30 days of the pilot review. Credit applies only then.",
        ),
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
        ws.row_dimensions[row].height = 28

    ws["A18"] = "This order"
    ws["A18"].font = SECTION_FONT
    # Subscription exists unless this order is a pilot that does not convert.
    subscribed = 'OR(arch_pilot=0,arch_pilot_converts>=1)'
    rows = [
        (19, "Rate-card platform monthly", "=list_mrr+MAX(0,arch_entities-1)*second_entity_mrr"),
        (20, "Platform list value (rate card x 12) — not ARR", "=B19*12"),
        (
            21,
            "Floor applies?",
            f'=IF(AND({subscribed},arch_entities>=2,arch_governance>=2,B19<arch_floor),"Yes","No")',
        ),
        (
            22,
            "Platform monthly invoiced",
            f'=IF(NOT({subscribed}),0,IF(AND(arch_entities>=2,arch_governance>=2,B19<arch_floor),arch_floor,B19))',
        ),
        (23, "Net contracted platform ARR (invoiced x 11)", "=B22*annual_months_paid"),
        (24, "Of which initial-entity contracted", f'=IF(NOT({subscribed}),0,list_mrr*annual_months_paid)'),
        (
            25,
            "Of which expansion ARR",
            f"=IF(NOT({subscribed}),0,MAX(0,arch_entities-1)*second_entity_mrr*annual_months_paid)",
        ),
        (26, "Of which floor premium, annual", "=B23-B24-B25"),
        (
            27,
            "Managed intelligence monthly",
            f'=IF(NOT({subscribed}),0,IF(arch_mi=1,svc_essential_price,IF(arch_mi=2,svc_advanced_price,IF(arch_mi=3,svc_strategic_price,0))))',
        ),
        (
            28,
            "Managed intelligence hours / month",
            f'=IF(NOT({subscribed}),0,IF(arch_mi=1,svc_essential_hours,IF(arch_mi=2,svc_advanced_hours,IF(arch_mi=3,svc_strategic_hours,0))))',
        ),
        (29, "Managed Intelligence ARR (12 months paid)", "=B27*12"),
        (30, "Total net contracted ARR", "=B23+B29"),
        (31, "Activation fee on the order", f"=IF(NOT({subscribed}),0,arch_onboarding_fee)"),
        (
            32,
            "Pilot fee invoiced",
            '=IF(arch_pilot=2,arch_pilot_fee,0)',
        ),
        (
            33,
            "Pilot credit against the initial-entity platform invoice",
            f'=IF(AND(arch_pilot=2,{subscribed}),MIN(arch_pilot_fee,list_mrr*annual_months_paid),0)',
        ),
        (34, "Year-1 platform invoice after credit", "=B23-B33"),
        (35, "Year-1 invoices (platform after credit + MI + activation fee + pilot fee)", "=B34+B29+B31+B32"),
        (36, "Year-1 cash collected (annual invoice, card share is a separate test)", "=B35"),
        (
            37,
            "Platform direct cost, year, founder-led account",
            f'=IF(NOT({subscribed}),0,(plat_infra_one+plat_ai_entity*arch_entities+plat_founder_platform+B22*card_share*card_rate+card_share*card_fixed_aud)*12)',
        ),
        (
            38,
            "Activation cost, once",
            f"=IF(NOT({subscribed}),0,arch_onboarding_hours*founder_opp_per_hour)",
        ),
        (
            39,
            "Times activation is inside year-1 cost",
            f'=IF(NOT({subscribed}),0,1)',
        ),
        (
            40,
            "Pilot delivery cost, fully loaded",
            "=IF(arch_pilot>=1,arch_pilot_hours*founder_opp_per_hour+plat_infra_one+plat_ai_entity,0)",
        ),
        (41, "Service cost, founder delivers", "=B28*founder_opp_per_hour*12+IF(B28=0,0,svc_ai_per_customer*12)"),
        (42, "Service cost, specialist at full-book rate", "=B28*svc_hour_cost*12+IF(B28=0,0,svc_ai_per_customer*12)"),
        (
            43,
            "Year-1 loaded margin, founder delivers platform and service",
            "=IF(B35=0,NA(),(B35-B37-B38-B40-B41)/B35)",
        ),
        (
            44,
            "Year-1 loaded margin, specialist full book and founder platform hours stopped",
            f'=IF(OR(B35=0,NOT({subscribed})),NA(),(B35-((plat_infra_per_n25+plat_ai_entity)*arch_entities+plat_support_hour+B22*card_share*card_rate+card_share*card_fixed_aud)*12-B38-B40-B42)/B35)',
        ),
    ]
    for row, label, formula in rows:
        ws.cell(row, 1, label).alignment = WRAP
        cell = ws.cell(row, 2, formula)
        cell.border = THIN
        if row in {21, 39}:
            cell.alignment = Alignment(horizontal="left")
            cell.number_format = "General"
        elif row in {43, 44}:
            cell.number_format = PCT
        elif row == 28:
            cell.number_format = "0.0"
        else:
            cell.number_format = AUD
        ws.row_dimensions[row].height = 20

    ws["A46"] = (
        "GST is not in these figures. Add it where registration and the customer’s place of supply require it. "
        "Net contracted ARR excludes the pilot and the activation line. A pilot credit reduces the year-1 platform invoice and does not reduce ARR. "
        "The credit cannot reduce Managed Intelligence, activation, or an additional entity. "
        "Activation cost is the row above, once. Monthly platform cost does not contain it. "
        "If a pilot does not convert, this block drops the subscription and keeps the pilot fee only. "
        "Forecast36 still adds a second entity at the full monthly rate, not at 11/12. That sheet was not rewritten. RevenueReporting states the difference."
    )
    ws["A46"].alignment = WRAP
    ws.merge_cells("A46:G48")

    ws["A50"] = "Worked platform examples — reconciliation rule"
    ws["A50"].font = SECTION_FONT
    headers = [
        "Configuration",
        "Entities",
        "Governance",
        "Service code",
        "Rate card monthly",
        "List value x12 (not ARR)",
        "Invoiced monthly",
        "Floor binds",
        "Annual contracted platform",
        "Expansion ARR",
        "Floor premium annual",
        "MI ARR",
        "Year-1 subscription revenue",
        "Founder-led year-1 GM",
        "Specialist year-1 GM",
        "2 Nov partial-cost founder GM",
        "What the row is for",
    ]
    for i, h in enumerate(headers, 1):
        ws.cell(51, i, h)
        ws.cell(51, i).fill = HEADER_FILL
        ws.cell(51, i).font = HEADER_FONT
        ws.cell(51, i).alignment = WRAP
    configs = [
        ("Single entity, platform only", 1, 0, 0, "Standard initial platform offer."),
        ("Single entity + Essential", 1, 0, 1, "Default service while the founder delivers."),
        ("Single entity + Advanced", 1, 0, 2, "Preferred only once a specialist is funded. Not the founder-led default."),
        ("Single entity + Strategic", 1, 0, 3, "Reserved for a real extra forum and available capacity."),
        ("Single entity + routine questionnaire", 1, 1, 0, "A questionnaire does not change the platform price."),
        ("Single entity + material governance", 1, 2, 0, "A single entity is not lifted to the floor."),
        ("Two entities, platform only", 2, 0, 0, "Second entity is platform software."),
        ("Two entities + Essential", 2, 0, 1, "Service is its own line. The second entity does not inherit hours."),
        ("Two entities + questionnaire + Essential", 2, 1, 1, "Questionnaire still does not bind the floor."),
        ("Two entities + material governance", 2, 2, 0, "Floor binds. Premium is platform revenue."),
        ("Two entities + material governance + Essential", 2, 2, 1, "Floor binds. Essential stays a separate line."),
        ("Two entities + material governance + Advanced", 2, 2, 2, "Floor binds. Advanced still waits on specialist capacity."),
        ("Three entities, platform only", 3, 0, 0, "Rate card is already above the floor, so the floor is dormant."),
    ]
    for i, (label, entities, gov, code, note) in enumerate(configs):
        r = 52 + i
        _scenario_row(ws, r, label, entities, gov, code, note, legacy=False)
    last = 51 + len(configs)

    legacy_title = last + 2
    ws.cell(legacy_title, 1, "Superseded floor trigger — kept so the 2 November draft is not lost").font = SECTION_FONT
    ws.merge_cells(start_row=legacy_title, start_column=1, end_row=legacy_title, end_column=8)
    ws.cell(
        legacy_title + 1,
        1,
        "Under the first architecture draft, any enterprise-terms flag lifted a two-entity rate card to the floor. A routine questionnaire would have been enough. The reconciliation refuses that. This row uses the old trigger on purpose.",
    ).alignment = WRAP
    ws.merge_cells(start_row=legacy_title + 1, start_column=1, end_row=legacy_title + 2, end_column=8)
    legacy_header = legacy_title + 3
    for i, h in enumerate(headers, 1):
        ws.cell(legacy_header, i, h)
        ws.cell(legacy_header, i).fill = HEADER_FILL
        ws.cell(legacy_header, i).font = HEADER_FONT
        ws.cell(legacy_header, i).alignment = WRAP
    legacy_row = legacy_header + 1
    _scenario_row(
        ws,
        legacy_row,
        "OLD RULE: two entities + questionnaire would have bound the floor",
        2,
        1,
        1,
        "Do not quote. Preserved to show the trigger that was removed.",
        legacy=True,
    )

    ws.column_dimensions["A"].width = 68
    ws.column_dimensions["B"].width = 18
    ws.column_dimensions["C"].width = 88
    for col in range(4, 18):
        ws.column_dimensions[get_column_letter(col)].width = 22
    ws.column_dimensions["Q"].width = 62
    ws.row_dimensions[51].height = 36
    ws.row_dimensions[legacy_header].height = 36
    ws.freeze_panes = "A52"
    ws.auto_filter.ref = f"A51:Q{last}"
    ws.sheet_properties.tabColor = "1F4E79"
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToPage = True
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.sheet_view.showGridLines = False
    ws.oddHeader.left.text = "ExecutiveOS  |  Offer architecture  |  Not an approved price"
    ws.oddFooter.left.text = "Braltiq  |  Confidential working model"
    ws.oddFooter.right.text = "Page &P of &N"


def _scenario_row(ws, r: int, label: str, entities: int, gov: int, code: int, note: str, legacy: bool) -> None:
    ws.cell(r, 1, label)
    ws.cell(r, 2, entities)
    ws.cell(r, 3, gov)
    ws.cell(r, 4, code)
    ws.cell(r, 5, f"=list_mrr+MAX(0,B{r}-1)*second_entity_mrr").number_format = AUD
    ws.cell(r, 6, f"=E{r}*12").number_format = AUD
    if legacy:
        invoiced = f"=IF(E{r}<arch_floor,arch_floor,E{r})"
        binds = f'=IF(E{r}<arch_floor,"Yes — old rule","No")'
    else:
        invoiced = f"=IF(AND(B{r}>=2,C{r}>=2,E{r}<arch_floor),arch_floor,E{r})"
        binds = f'=IF(AND(B{r}>=2,C{r}>=2,E{r}<arch_floor),"Yes","No")'
    ws.cell(r, 7, invoiced).number_format = AUD
    ws.cell(r, 8, binds)
    ws.cell(r, 9, f"=G{r}*annual_months_paid").number_format = AUD
    ws.cell(r, 10, f"=MAX(0,B{r}-1)*second_entity_mrr*annual_months_paid").number_format = AUD
    ws.cell(r, 11, f"=I{r}-list_mrr*annual_months_paid-J{r}").number_format = AUD
    ws.cell(
        r,
        12,
        f"=IF(D{r}=1,svc_essential_price,IF(D{r}=2,svc_advanced_price,IF(D{r}=3,svc_strategic_price,0)))*12",
    ).number_format = AUD
    ws.cell(r, 13, f"=I{r}+L{r}+arch_onboarding_fee").number_format = AUD
    hours = f"IF(D{r}=1,svc_essential_hours,IF(D{r}=2,svc_advanced_hours,IF(D{r}=3,svc_strategic_hours,0)))"
    founder_cost = (
        f"(plat_infra_one+plat_ai_entity*B{r}+plat_founder_platform+G{r}*card_share*card_rate+card_share*card_fixed_aud)*12"
        f"+arch_onboarding_hours*founder_opp_per_hour"
        f"+({hours})*founder_opp_per_hour*12+IF(D{r}=0,0,svc_ai_per_customer*12)"
    )
    specialist_cost = (
        f"((plat_infra_per_n25+plat_ai_entity)*B{r}+plat_support_hour+G{r}*card_share*card_rate+card_share*card_fixed_aud)*12"
        f"+arch_onboarding_hours*founder_opp_per_hour"
        f"+({hours})*svc_hour_cost*12+IF(D{r}=0,0,svc_ai_per_customer*12)"
    )
    historical_cost = (
        f"MarginMix!B14*12*B{r}+arch_onboarding_hours*founder_opp_per_hour+({hours})*founder_opp_per_hour*12"
    )
    ws.cell(r, 14, f"=IF(M{r}=0,NA(),(M{r}-({founder_cost}))/M{r})").number_format = PCT
    ws.cell(r, 15, f"=IF(M{r}=0,NA(),(M{r}-({specialist_cost}))/M{r})").number_format = PCT
    ws.cell(r, 16, f"=IF(M{r}=0,NA(),(M{r}-({historical_cost}))/M{r})").number_format = PCT
    ws.cell(r, 17, note).alignment = WRAP
    for c in range(1, 18):
        ws.cell(r, c).border = THIN
        ws.cell(r, c).alignment = WRAP
    ws.row_dimensions[r].height = 32
