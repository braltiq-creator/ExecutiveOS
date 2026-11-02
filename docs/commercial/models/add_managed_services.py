"""Add managed-intelligence sheets to the industrial unit-economics workbook.

Does not rewrite Assumptions, UnitEconomics, Scale, Acquisition, Forecast36, or Sensitivity.
Those sheets stay the platform-only model. New sheets reference them.
"""

from __future__ import annotations

from openpyxl.chart import LineChart, Reference
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.worksheet import Worksheet

NAVY = "1F4E79"
YELLOW = "FFF2CC"
GREEN = "E2EFDA"
BLUE_FONT = Font(name="Calibri", size=11, color="1F4E79", bold=True)
HEADER_FILL = PatternFill("solid", fgColor=NAVY)
HEADER_FONT = Font(name="Calibri", size=11, color="FFFFFF", bold=True)
SECTION_FILL = PatternFill("solid", fgColor="D6E3F0")
SECTION_FONT = Font(name="Calibri", size=12, bold=True, color=NAVY)
INPUT_FILL = PatternFill("solid", fgColor=YELLOW)
DERIVED_FILL = PatternFill("solid", fgColor=GREEN)
THIN = Border(
    left=Side(style="thin", color="D9D9D9"),
    right=Side(style="thin", color="D9D9D9"),
    top=Side(style="thin", color="D9D9D9"),
    bottom=Side(style="thin", color="D9D9D9"),
)
WRAP = Alignment(wrap_text=True, vertical="center")

# Forecast36 block starts. Ending = start+3, MRR = start+4, CSM = start+7,
# cash COGS = start+8, cash operating profit = start+10, loaded OP = start+12.
# Data row = 6 + month.
FC_STARTS = (1, 15, 29)


def _inputs() -> list[tuple[str, float | int | str, str, str, str]]:
    return [
        ("section_svc_status", "MANAGED INTELLIGENCE — NOT AN APPROVED PRICE", "", "section", ""),
        (
            "svc_salary",
            140000,
            "AUD / year",
            "input",
            "Hypothesis. Intelligence specialist base salary, Brisbane. Not a job offer and not in the repository.",
        ),
        (
            "svc_super_rate",
            0.12,
            "fraction of salary",
            "source",
            "ATO super guarantee 12% from 1 July 2025, still 12% for 1 July 2026–30 June 2027. ato.gov.au super guarantee table, read 1 Nov 2026.",
        ),
        (
            "svc_workers_comp_rate",
            0.01,
            "fraction of salary",
            "input",
            "HYPOTHESIS. WorkCover rates vary by industry and claims. Not a quoted WorkCover premium.",
        ),
        (
            "svc_other_oncost_rate",
            0.02,
            "fraction of salary",
            "input",
            "HYPOTHESIS for insurance and small employment on-costs other than super, workers comp, and payroll tax.",
        ),
        (
            "svc_payroll_tax_rate",
            0.0475,
            "fraction",
            "source",
            "Queensland 4.75% when Australian taxable wages are $6.5m or less. Threshold $1.3m. qro.qld.gov.au, page dated 17 Jul 2024; payrolltax.gov.au still showed this on 13 Oct 2026.",
        ),
        (
            "svc_payroll_tax_threshold",
            1300000,
            "AUD wages / year",
            "source",
            "Queensland annual threshold. Below it, this model applies no payroll tax. Mental health levy (above $10m) is ignored.",
        ),
        (
            "svc_apply_payroll_tax",
            0,
            "1 = yes",
            "input",
            "Default 0. Turn on for a book whose Australian taxable wages exceed the threshold. Super is included in the formula when this is 1.",
        ),
        (
            "svc_tools_month",
            150,
            "AUD / person / month",
            "input",
            "HYPOTHESIS. Laptop, support desk, and service-tracking tool. No vendor is named because none is contracted.",
        ),
        (
            "svc_weeks",
            45,
            "weeks / year",
            "input",
            "52 minus 4 weeks leave, about 2 weeks of public holidays, and 1 week of sick and training. Editable.",
        ),
        (
            "svc_hours_week",
            37.5,
            "hours",
            "input",
            "Nominal week. Delivery hours are this times utilization.",
        ),
        (
            "svc_utilization",
            0.65,
            "fraction",
            "input",
            "Share of nominal hours that are customer delivery. The rest is service management, internal work, and slack. Do not also add a second management percentage.",
        ),
        (
            "svc_target_gm",
            0.65,
            "fraction",
            "input",
            "Fully loaded gross-margin floor for the service line at steady utilization. Design aim at a full book is higher. This is not the SaaS target.",
        ),
        (
            "svc_founder_bridge_hours",
            24,
            "hours / month",
            "input",
            "Maximum founder hours on managed intelligence. Above this, and below the hire threshold, the model refuses the extra demand.",
        ),
        (
            "svc_hire_at_hours",
            78,
            "hours / month",
            "input",
            "Hire only when the extra book is about 78 hours. That is the point an Essential-priced book covers a full salary at the 65% floor. Do not hire the next person for a remainder smaller than this.",
        ),
        ("section_svc_pkg", "PACKAGE PRICES AND HOUR CAPS — RECOMMENDATION", "", "section", ""),
        (
            "svc_essential_price",
            3000,
            "AUD / month",
            "input",
            "Recommended quote. The discussed floor of 2500 fails the 65% test at 6 hours. Not approved.",
        ),
        ("svc_essential_hours", 6, "hours / month", "input", "Hard cap. Includes prep and the meeting. Not a pool the customer draws at will."),
        (
            "svc_advanced_price",
            6500,
            "AUD / month",
            "input",
            "Recommended quote inside the discussed 5000–7500 band. 5000 fails 65% at 12 hours.",
        ),
        ("svc_advanced_hours", 12, "hours / month", "input", "Hard cap."),
        (
            "svc_strategic_price",
            12000,
            "AUD / month",
            "input",
            "Recommended quote. 15000 is not the default: at a thicker hour cap it pulls the combined customer under 80%.",
        ),
        ("svc_strategic_hours", 16, "hours / month", "input", "Hard cap. About two working days, not a retained consultant."),
        (
            "svc_extra_hour_price",
            450,
            "AUD / hour",
            "input",
            "Prepaid blocks of 3 only. Not an open consulting rate. Priced above delivery cost so overage does not dilute the package.",
        ),
        (
            "svc_onsite_day",
            2500,
            "AUD / day",
            "input",
            "Excluded from every package. Travel is extra at cost. A quarterly site visit is a separate order.",
        ),
        (
            "svc_contractor_hour",
            220,
            "AUD / hour",
            "input",
            "HYPOTHESIS cash rate. Super may still be owed if the contractor is paid mainly for labour. Not the default delivery model.",
        ),
        (
            "svc_extra_completions",
            40,
            "completions / service customer / month",
            "input",
            "One scheduled small-model note before the human review. Not a continuous agent. Uses the platform token-price assumptions.",
        ),
        ("section_svc_mix", "36-MONTH ATTACH RATES — SHARE OF PLATFORM LOGOS", "", "section", ""),
        ("svc_reclass_csm", 1, "1 = yes", "input", "When a specialist is employed, remove Forecast36 CSM cost from the combined COGS so high-touch labour is not counted twice."),
        ("svc_cons_ess", 0.15, "fraction of logos", "input", "Conservative. Essential only. Stays inside the founder hour cap."),
        ("svc_cons_adv", 0.0, "fraction of logos", "input", "Conservative sells no Advanced."),
        ("svc_cons_str", 0.0, "fraction of logos", "input", "Conservative sells no Strategic."),
        ("svc_base_ess", 0.20, "fraction of logos", "input", "Base. Sized so month-36 demand is near the founder cap, not a half-empty hire."),
        ("svc_base_adv", 0.08, "fraction of logos", "input", "Base Advanced attach."),
        ("svc_base_str", 0.0, "fraction of logos", "input", "Base does not sell Strategic until a specialist is full."),
        ("svc_agg_ess", 0.25, "fraction of logos", "input", "Aggressive."),
        ("svc_agg_adv", 0.20, "fraction of logos", "input", "Aggressive."),
        ("svc_agg_str", 0.10, "fraction of logos", "input", "Aggressive. Still a minority of logos."),
        (
            "svc_uplift",
            0.04,
            "fraction / year",
            "input",
            "UNAPPROVED. Working hypothesis only, subject to final contract wording and legal and accounting review. Steps service price from month 13. Not applied to Forecast36 platform prices. Not a renewal term in force.",
        ),
        (
            "svc_blend_ess",
            0.50,
            "fraction",
            "input",
            "Standard mix used on the scale sheet. Shares should add to 1.",
        ),
        ("svc_blend_adv", 0.30, "fraction", "input", "Standard mix."),
        ("svc_blend_str", 0.20, "fraction", "input", "Standard mix."),
        ("section_svc_capacity", "CAPACITY TEST — DOES NOT DRIVE SERVICEFORECAST36", "", "section", ""),
        (
            "svc_founder_residual_hours",
            8,
            "hours / month",
            "input",
            "Working assumption for oversight that continues after a specialist is hired. Not observed. ServiceForecast36 still sets founder delivery hours to 0 at hire. This cell does not feed that sheet.",
        ),
        (
            "svc_pipeline_hours",
            0,
            "hours / month",
            "input",
            "Forecast pipeline. Never a hire trigger.",
        ),
        (
            "svc_verbal_hours",
            0,
            "hours / month",
            "input",
            "Verbal commitments. Never a hire trigger.",
        ),
        (
            "svc_ready_hours",
            0,
            "hours / month",
            "input",
            "Contracted hours ready to start. The hire test reads this cell and ignores pipeline and verbal hours.",
        ),
    ]


def _style_header(ws: Worksheet, row: int, cols: int) -> None:
    for col in range(1, cols + 1):
        cell = ws.cell(row, col)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = WRAP


def _write_assumptions(wb) -> None:
    ws = wb.create_sheet("ServiceAssumptions")
    ws["A1"] = "Key"
    ws["B1"] = "Value"
    ws["C1"] = "Unit"
    ws["D1"] = "Kind"
    ws["E1"] = "Source or note"
    _style_header(ws, 1, 5)
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = "A1:E80"
    rows: dict[str, int] = {}
    for offset, (name, value, unit, kind, note) in enumerate(_inputs(), start=2):
        rows[name] = offset
        ws.cell(offset, 1, name)
        cell = ws.cell(offset, 2, value if kind != "section" else None)
        ws.cell(offset, 3, unit)
        ws.cell(offset, 4, kind)
        ws.cell(offset, 5, note).alignment = WRAP
        ws.row_dimensions[offset].height = 32
        if kind == "section":
            for col in range(1, 6):
                ws.cell(offset, col).fill = SECTION_FILL
                ws.cell(offset, col).font = SECTION_FONT
            continue
        cell.fill = INPUT_FILL
        cell.font = BLUE_FONT
        cell.border = THIN
        if isinstance(value, float) and value < 1:
            cell.number_format = "0.00%"
        elif isinstance(value, float):
            cell.number_format = "#,##0.00"
        else:
            cell.number_format = "#,##0"
        wb.defined_names.add(DefinedName(name, attr_text=f"ServiceAssumptions!$B${offset}"))

    # Derived block. Green cells. Named.
    start = max(rows.values()) + 2
    ws.cell(start, 1, "DERIVED — DO NOT EDIT").font = SECTION_FONT
    derived = [
        ("svc_nominal_hours", f"=svc_weeks*svc_hours_week", "Nominal hours / year"),
        ("svc_delivery_year", f"=svc_nominal_hours*svc_utilization", "Delivery hours / year at target utilization"),
        ("svc_delivery_month", f"=svc_delivery_year/12", "Delivery hours / month"),
        (
            "svc_annual_loaded",
            "=svc_salary*(1+svc_super_rate+svc_workers_comp_rate+svc_other_oncost_rate)"
            "+IF(svc_apply_payroll_tax>=1,svc_salary*(1+svc_super_rate)*svc_payroll_tax_rate,0)"
            "+svc_tools_month*12",
            "Fully loaded cost / year, one specialist",
        ),
        ("svc_month_cost", "=svc_annual_loaded/12", "Fully loaded cost / month, one specialist"),
        ("svc_hour_cost", "=IF(svc_delivery_year=0,NA(),svc_annual_loaded/svc_delivery_year)", "AUD per delivery hour at target utilization"),
        (
            "svc_ai_per_customer",
            "=svc_extra_completions*(input_tokens/1000000*price_in_usd_per_m+output_tokens/1000000*price_out_usd_per_m)*fx_aud_per_usd",
            "AUD / month. Scheduled small-model note. Platform token prices.",
        ),
    ]
    for i, (name, formula, note) in enumerate(derived):
        r = start + 1 + i
        ws.cell(r, 1, name)
        cell = ws.cell(r, 2, formula)
        cell.fill = DERIVED_FILL
        cell.border = THIN
        cell.number_format = '"$"#,##0.00' if "cost" in name or "loaded" in name or "ai" in name or "hour_cost" in name else "#,##0.00"
        if name == "svc_ai_per_customer":
            cell.number_format = '"$"#,##0.000'
        ws.cell(r, 5, note).alignment = WRAP
        ws.row_dimensions[r].height = 22
        wb.defined_names.add(DefinedName(name, attr_text=f"ServiceAssumptions!$B${r}"))
    ws.column_dimensions["A"].width = 36
    ws.column_dimensions["B"].width = 20
    ws.column_dimensions["C"].width = 28
    ws.column_dimensions["D"].width = 14
    ws.column_dimensions["E"].width = 88
    ws.sheet_properties.tabColor = "F4B183"
    ws.auto_filter.ref = f"A1:E{start + len(derived)}"
    ws["A1"].font = HEADER_FONT


def _package_sheet(wb) -> None:
    ws = wb.create_sheet("ServicePackages")
    ws["A1"] = "Package economics at the recommended caps"
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:G1")
    ws["A2"] = (
        "Specialist margin assumes the person is full at the utilization target. "
        "A half-empty hire is on ServiceScale, not in this table. "
        "Founder time is priced at founder_opp_per_hour. It is not free. "
        "AI is the scheduled note only."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:G3")
    headers = [
        "Package",
        "Price",
        "Hours",
        "Specialist cost",
        "Specialist GM",
        "Clears target?",
        "Founder cost",
        "Founder GM",
        "Founder clears?",
        "Contractor GM",
        "Customers per full specialist",
    ]
    for i, h in enumerate(headers, 1):
        ws.cell(5, i, h)
    _style_header(ws, 5, len(headers))
    packages = [
        ("Essential", "svc_essential_price", "svc_essential_hours"),
        ("Advanced", "svc_advanced_price", "svc_advanced_hours"),
        ("Strategic", "svc_strategic_price", "svc_strategic_hours"),
    ]
    for i, (label, price, hours) in enumerate(packages):
        r = 6 + i
        ws.cell(r, 1, label)
        ws.cell(r, 2, f"={price}").number_format = '"$"#,##0'
        ws.cell(r, 3, f"={hours}").number_format = "0.0"
        ws.cell(r, 4, f"=C{r}*svc_hour_cost+svc_ai_per_customer").number_format = '"$"#,##0'
        ws.cell(r, 5, f"=IF(B{r}=0,NA(),(B{r}-D{r})/B{r})").number_format = "0.0%"
        ws.cell(r, 6, f'=IF(E{r}>=svc_target_gm,"Yes","No")')
        ws.cell(r, 7, f"=C{r}*founder_opp_per_hour+svc_ai_per_customer").number_format = '"$"#,##0'
        ws.cell(r, 8, f"=IF(B{r}=0,NA(),(B{r}-G{r})/B{r})").number_format = "0.0%"
        ws.cell(r, 9, f'=IF(H{r}>=svc_target_gm,"Yes","No")')
        ws.cell(r, 10, f"=IF(B{r}=0,NA(),(B{r}-C{r}*svc_contractor_hour-svc_ai_per_customer)/B{r})").number_format = "0.0%"
        ws.cell(r, 11, f"=IF(C{r}=0,NA(),svc_delivery_month/C{r})").number_format = "0.0"
        for c in range(1, 12):
            ws.cell(r, c).border = THIN

    ws["A10"] = "Same hour caps at the prices that were discussed and are not recommended"
    ws["A10"].font = SECTION_FONT
    for i, h in enumerate(["Discussed price", "Uses hours of", "Hours", "Specialist GM", "Clears 65% design target?"], 1):
        ws.cell(11, i, h)
    _style_header(ws, 11, 5)
    challenges = [
        (2500, "Essential", "=svc_essential_hours"),
        (3500, "Essential", "=svc_essential_hours"),
        (5000, "Advanced", "=svc_advanced_hours"),
        (7500, "Advanced", "=svc_advanced_hours"),
        (10000, "Strategic", "=svc_strategic_hours"),
        (15000, "Strategic", "=svc_strategic_hours"),
        (15000, "Strategic at 30 hours", 30),
    ]
    for i, (price, label, hours) in enumerate(challenges):
        r = 12 + i
        ws.cell(r, 1, price).number_format = '"$"#,##0'
        ws.cell(r, 2, label)
        ws.cell(r, 3, hours).number_format = "0"
        ws.cell(r, 4, f"=IF(A{r}=0,NA(),(A{r}-C{r}*svc_hour_cost-svc_ai_per_customer)/A{r})").number_format = "0.0%"
        ws.cell(r, 5, f'=IF(D{r}>=svc_target_gm,"Yes","No")')
        for c in range(1, 6):
            ws.cell(r, c).border = THIN
    ws["A20"] = (
        "Travel and on-site days are not in these margins. One domestic trip can consume an Essential month of delivery budget. "
        "Extra hours are not assumed. Overage at svc_extra_hour_price is margin-accretive only while the buyer prepays a block and the work stays inside the exclusions."
    )
    ws["A20"].alignment = WRAP
    ws.merge_cells("A20:K21")
    widths = [28, 22, 14, 20, 18, 16, 18, 16, 16, 16, 28]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.sheet_properties.tabColor = "548235"
    ws.row_dimensions[5].height = 32
    ws.row_dimensions[11].height = 32


def _scale_sheet(wb) -> None:
    ws = wb.create_sheet("ServiceScale")
    ws["A1"] = "Serving 1, 5, 10, 25 and 50 managed-intelligence customers"
    ws["A1"].font = SECTION_FONT
    ws["A2"] = (
        "Block A forces a specialist hire sized to the hours, so idle salary is visible. "
        "Block B is the policy: founder up to the bridge, no hire until svc_hire_at_hours, and no revenue for hours the founder will not work."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:L3")
    headers = [
        "Customers",
        "Package or mix",
        "Hours demanded",
        "Revenue if all served",
        "Heads to serve all",
        "Wage cost",
        "AI",
        "Loaded GM if hire is forced",
        "Customers per specialist at full book",
        "Policy heads",
        "Policy delivered hours",
        "Policy revenue",
        "Policy loaded cost",
        "Policy loaded GM",
        "Hours not taken",
    ]
    for i, h in enumerate(headers, 1):
        ws.cell(5, i, h)
    _style_header(ws, 5, len(headers))
    ws.row_dimensions[5].height = 36
    # Mix hours and price named via formulas inline
    mixes = [
        ("Essential", "svc_essential_hours", "svc_essential_price"),
        ("Advanced", "svc_advanced_hours", "svc_advanced_price"),
        ("Strategic", "svc_strategic_hours", "svc_strategic_price"),
        (
            "Blend",
            "svc_blend_ess*svc_essential_hours+svc_blend_adv*svc_advanced_hours+svc_blend_str*svc_strategic_hours",
            "svc_blend_ess*svc_essential_price+svc_blend_adv*svc_advanced_price+svc_blend_str*svc_strategic_price",
        ),
    ]
    counts = [1, 5, 10, 25, 50]
    row = 6
    for label, hours_expr, price_expr in mixes:
        for n in counts:
            ws.cell(row, 1, n)
            ws.cell(row, 2, label)
            ws.cell(row, 3, f"={n}*({hours_expr})").number_format = "#,##0.0"
            ws.cell(row, 4, f"={n}*({price_expr})").number_format = '"$"#,##0'
            ws.cell(row, 5, f"=IF(C{row}=0,0,MAX(1,ROUNDUP(C{row}/svc_delivery_month,0)))").number_format = "0"
            ws.cell(row, 6, f"=E{row}*svc_month_cost").number_format = '"$"#,##0'
            ws.cell(row, 7, f"={n}*svc_ai_per_customer").number_format = '"$"#,##0'
            ws.cell(row, 8, f"=IF(D{row}=0,NA(),(D{row}-F{row}-G{row})/D{row})").number_format = "0.0%"
            ws.cell(row, 9, f"=IF(({hours_expr})=0,NA(),svc_delivery_month/({hours_expr}))").number_format = "0.0"
            # Policy
            ws.cell(
                row,
                10,
                f'=IF(C{row}<svc_hire_at_hours,0,MAX(1,ROUNDDOWN(C{row}/svc_delivery_month,0))+IF(AND(ROUNDDOWN(C{row}/svc_delivery_month,0)>=1,MOD(C{row},svc_delivery_month)>=svc_hire_at_hours),1,0))',
            ).number_format = "0"
            ws.cell(
                row,
                11,
                f"=IF(J{row}>=1,MIN(C{row},J{row}*svc_delivery_month),MIN(C{row},svc_founder_bridge_hours))",
            ).number_format = "#,##0.0"
            ws.cell(row, 12, f"=IF(C{row}=0,0,D{row}*K{row}/C{row})").number_format = '"$"#,##0'
            ws.cell(
                row,
                13,
                f"=IF(J{row}>=1,J{row}*svc_month_cost,K{row}*founder_opp_per_hour)+G{row}*IF(C{row}=0,0,K{row}/C{row})",
            ).number_format = '"$"#,##0'
            ws.cell(row, 14, f"=IF(L{row}=0,NA(),(L{row}-M{row})/L{row})").number_format = "0.0%"
            ws.cell(row, 15, f"=C{row}-K{row}").number_format = "#,##0.0"
            for c in range(1, 16):
                ws.cell(row, c).border = THIN
            row += 1
        row += 1
    ws.freeze_panes = "C6"
    for i, w in enumerate([12, 16, 16, 20, 18, 14, 12, 24, 28, 14, 22, 16, 20, 18, 16], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.sheet_properties.tabColor = "548235"
    note_row = row + 1
    ws.cell(
        note_row,
        1,
        "Forced-hire margin at 1 or 5 Essential customers is poor because the salary is paid for an empty book. "
        "That is why the policy column withholds the hire. Customers per specialist is the full-book figure, not the headcount in a thin month.",
    ).alignment = WRAP
    ws.merge_cells(start_row=note_row, start_column=1, end_row=note_row + 1, end_column=8)


def _mix_sheet(wb) -> None:
    ws = wb.create_sheet("MarginMix")
    ws["A1"] = "SaaS, managed intelligence, and the customer taken together"
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:F1")
    ws["A2"] = (
        "Platform price is the unapproved list and the collected annual equivalent from Assumptions. "
        "SaaS COGS per customer at 25 logos is taken from Scale and is not re-derived here. "
        "Reclassified SaaS COGS removes the CSM line, because that labour moves to the service package when one is sold. "
        "Service cost here is the full-book specialist hour, not a half-empty salary."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:F4")
    headers = ["", "Platform only", "Plus Essential", "Plus Advanced", "Plus Strategic"]
    for i, h in enumerate(headers, 1):
        ws.cell(6, i, h)
    _style_header(ws, 6, 5)
    # Scale row for 25 customers is row 8 (1,5,10,25 → rows 5,6,7,8)
    labels = [
        (7, "Platform list price", "=$B$7"),  # placeholder replaced below
    ]
    ws["A7"] = "Platform list (AUD / month)"
    ws["B7"] = "=list_mrr"
    ws["C7"] = "=B7"
    ws["D7"] = "=B7"
    ws["E7"] = "=B7"
    ws["A8"] = "Platform collected (AUD / month)"
    ws["B8"] = "=hyp_mrr"
    for col in ("C", "D", "E"):
        ws[f"{col}8"] = f"={col}7"  # wrong - collected is same on all. Use B8
    ws["C8"] = "=B8"
    ws["D8"] = "=B8"
    ws["E8"] = "=B8"
    ws["A9"] = "Service price"
    ws["B9"] = 0
    ws["C9"] = "=svc_essential_price"
    ws["D9"] = "=svc_advanced_price"
    ws["E9"] = "=svc_strategic_price"
    ws["A10"] = "Service hours"
    ws["B10"] = 0
    ws["C10"] = "=svc_essential_hours"
    ws["D10"] = "=svc_advanced_hours"
    ws["E10"] = "=svc_strategic_hours"
    ws["A12"] = "SaaS COGS at 25 logos, as Scale models it (includes CSM)"
    ws["B12"] = "=Scale!L8/Scale!A8"
    for col in ("C", "D", "E"):
        ws[f"{col}12"] = "=$B12"
    ws["A13"] = "Of which CSM allocation"
    ws["B13"] = "=Scale!I8/Scale!A8"
    for col in ("C", "D", "E"):
        ws[f"{col}13"] = "=$B13"
    ws["A14"] = "Reclassified SaaS COGS (CSM removed)"
    ws["B14"] = "=B12-B13"
    for col in ("C", "D", "E"):
        ws[f"{col}14"] = f"={col}12-{col}13"
    ws["A15"] = "Service delivery cost at full book"
    ws["B15"] = 0
    ws["C15"] = "=C10*svc_hour_cost+svc_ai_per_customer"
    ws["D15"] = "=D10*svc_hour_cost+svc_ai_per_customer"
    ws["E15"] = "=E10*svc_hour_cost+svc_ai_per_customer"
    ws["A17"] = "SaaS gross margin, list, CSM still inside SaaS"
    ws["B17"] = "=IF(B7=0,NA(),(B7-B12)/B7)"
    for col in ("C", "D", "E"):
        ws[f"{col}17"] = f"=IF({col}7=0,NA(),({col}7-{col}12)/{col}7)"
    ws["A18"] = "SaaS gross margin, list, reclassified"
    ws["B18"] = "=IF(B7=0,NA(),(B7-B14)/B7)"
    for col in ("C", "D", "E"):
        ws[f"{col}18"] = f"=IF({col}7=0,NA(),({col}7-{col}14)/{col}7)"
    ws["A19"] = "Service gross margin, full book"
    ws["B19"] = "n/a"
    ws["C19"] = "=IF(C9=0,NA(),(C9-C15)/C9)"
    ws["D19"] = "=IF(D9=0,NA(),(D9-D15)/D9)"
    ws["E19"] = "=IF(E9=0,NA(),(E9-E15)/E9)"
    ws["A20"] = "Combined margin, list, ADDING service on top of CSM-in-SaaS (double count)"
    ws["B20"] = "=B17"
    ws["C20"] = "=IF(C7+C9=0,NA(),(C7+C9-C12-C15)/(C7+C9))"
    ws["D20"] = "=IF(D7+D9=0,NA(),(D7+D9-D12-D15)/(D7+D9))"
    ws["E20"] = "=IF(E7+E9=0,NA(),(E7+E9-E12-E15)/(E7+E9))"
    ws["A21"] = "Combined margin, list, reclassified (design)"
    ws["B21"] = "=B18"
    ws["C21"] = "=IF(C7+C9=0,NA(),(C7+C9-C14-C15)/(C7+C9))"
    ws["D21"] = "=IF(D7+D9=0,NA(),(D7+D9-D14-D15)/(D7+D9))"
    ws["E21"] = "=IF(E7+E9=0,NA(),(E7+E9-E14-E15)/(E7+E9))"
    ws["A22"] = "Combined margin, collected platform rate, reclassified"
    ws["B22"] = "=IF(B8=0,NA(),(B8-B14)/B8)"
    ws["C22"] = "=IF(C8+C9=0,NA(),(C8+C9-C14-C15)/(C8+C9))"
    ws["D22"] = "=IF(D8+D9=0,NA(),(D8+D9-D14-D15)/(D8+D9))"
    ws["E22"] = "=IF(E8+E9=0,NA(),(E8+E9-E14-E15)/(E8+E9))"
    ws["A23"] = "Service share of the combined list invoice"
    ws["B23"] = 0
    ws["C23"] = "=IF(C7+C9=0,NA(),C9/(C7+C9))"
    ws["D23"] = "=IF(D7+D9=0,NA(),D9/(D7+D9))"
    ws["E23"] = "=IF(E7+E9=0,NA(),E9/(E7+E9))"
    for r in range(7, 24):
        for c in range(1, 6):
            cell = ws.cell(r, c)
            cell.border = THIN
            cell.alignment = WRAP
            if c > 1 and r in {17, 18, 19, 20, 21, 22, 23}:
                if not (r == 19 and c == 2):
                    cell.number_format = "0.0%"
            elif c > 1 and r != 10:
                cell.number_format = '"$"#,##0'
        ws.row_dimensions[r].height = 20
    ws.row_dimensions[12].height = 32
    ws.row_dimensions[20].height = 32
    ws.row_dimensions[10].height = 18
    for col in range(2, 6):
        ws.cell(10, col).number_format = "0.0"
    ws["A25"] = (
        "The double-count row is what happens if the platform still carries a 1:15 CSM and the customer also buys a specialist. "
        "Do not run the company that way. The reclassified row is the design. "
        "It still assumes the specialist's book is full. ServiceScale shows the months when it is not."
    )
    ws["A25"].alignment = WRAP
    ws.merge_cells("A25:E27")
    ws.column_dimensions["A"].width = 78
    for col in range(2, 6):
        ws.column_dimensions[get_column_letter(col)].width = 22
    ws.sheet_properties.tabColor = "C65911"


def _forecast_sheet(wb) -> None:
    ws = wb.create_sheet("ServiceForecast36")
    ws["A1"] = "36-month managed intelligence, read off Forecast36 logos. Platform formulas are not changed."
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:R1")
    ws["A2"] = (
        "Attach rates are shares of Forecast36 ending logos. Prices step by svc_uplift each year. "
        "Revenue is recognised only for hours the policy will staff. "
        "Company cash operating profit equals Forecast36 cash operating profit plus service cash gross profit. "
        "Founder service time is not in that cash figure. It is in the loaded figure."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:R3")
    # 16 columns per scenario
    titles = ["Conservative", "Base", "Aggressive"]
    shares = [
        ("svc_cons_ess", "svc_cons_adv", "svc_cons_str"),
        ("svc_base_ess", "svc_base_adv", "svc_base_str"),
        ("svc_agg_ess", "svc_agg_adv", "svc_agg_str"),
    ]
    headers = [
        "Logos",
        "Hours demanded",
        "Heads",
        "Delivered hours",
        "Hours not taken",
        "Service revenue",
        "Specialist cash cost",
        "Founder hours",
        "Service cash GP",
        "Service loaded GM",
        "Platform MRR",
        "Platform cash COGS",
        "Combined revenue",
        "Combined cash COGS",
        "Combined cash GM",
        "Company cash operating profit",
    ]
    starts = [1, 18, 35]
    for b, title in enumerate(titles):
        c0 = starts[b]
        ws.cell(5, c0, title).fill = HEADER_FILL
        ws.cell(5, c0).font = HEADER_FONT
        for i, h in enumerate(headers):
            cell = ws.cell(6, c0 + i, h)
            cell.fill = HEADER_FILL
            cell.font = HEADER_FONT
            cell.alignment = WRAP
        ess, adv, st = shares[b]
        fc0 = FC_STARTS[b]
        for m in range(1, 37):
            r = 6 + m
            fr = 6 + m  # same row number on Forecast36
            logo = f"Forecast36!{get_column_letter(fc0 + 3)}{fr}"
            mrr = f"Forecast36!{get_column_letter(fc0 + 4)}{fr}"
            csm = f"Forecast36!{get_column_letter(fc0 + 7)}{fr}"
            cogs = f"Forecast36!{get_column_letter(fc0 + 8)}{fr}"
            op = f"Forecast36!{get_column_letter(fc0 + 10)}{fr}"
            year_pow = f"INT(({m}-1)/12)"
            # price factor
            factor = f"(1+svc_uplift)^{year_pow}"
            hours = (
                f"{logo}*({ess}*svc_essential_hours+{adv}*svc_advanced_hours+{st}*svc_strategic_hours)"
            )
            rev_full = (
                f"{logo}*({ess}*svc_essential_price+{adv}*svc_advanced_price+{st}*svc_strategic_price)*{factor}"
            )
            ws.cell(r, c0, f"={logo}").number_format = "0.00"
            ws.cell(r, c0 + 1, f"={hours}").number_format = "#,##0.0"
            hcell = f"{get_column_letter(c0 + 1)}{r}"
            ws.cell(
                r,
                c0 + 2,
                f"=IF({hcell}<svc_hire_at_hours,0,MAX(1,ROUNDDOWN({hcell}/svc_delivery_month,0))+IF(AND(ROUNDDOWN({hcell}/svc_delivery_month,0)>=1,MOD({hcell},svc_delivery_month)>=svc_hire_at_hours),1,0))",
            ).number_format = "0"
            head = f"{get_column_letter(c0 + 2)}{r}"
            ws.cell(
                r,
                c0 + 3,
                f"=IF({head}>=1,MIN({hcell},{head}*svc_delivery_month),MIN({hcell},svc_founder_bridge_hours))",
            ).number_format = "#,##0.0"
            delivered = f"{get_column_letter(c0 + 3)}{r}"
            ws.cell(r, c0 + 4, f"={hcell}-{delivered}").number_format = "#,##0.0"
            ws.cell(
                r,
                c0 + 5,
                f"=IF({hcell}=0,0,({rev_full})*{delivered}/{hcell})",
            ).number_format = '"$"#,##0'
            rev = f"{get_column_letter(c0 + 5)}{r}"
            # customers delivered proportional
            ws.cell(
                r,
                c0 + 6,
                f"=IF({head}>=1,{head}*svc_month_cost,0)+{logo}*({ess}+{adv}+{st})*svc_ai_per_customer*IF({hcell}=0,0,{delivered}/{hcell})",
            ).number_format = '"$"#,##0'
            cash = f"{get_column_letter(c0 + 6)}{r}"
            ws.cell(r, c0 + 7, f"=IF({head}>=1,0,{delivered})").number_format = "#,##0.0"
            ws.cell(r, c0 + 8, f"={rev}-{cash}").number_format = '"$"#,##0'
            founder_cost = f"{get_column_letter(c0 + 7)}{r}*founder_opp_per_hour"
            ws.cell(
                r,
                c0 + 9,
                f"=IF({rev}=0,NA(),({rev}-{cash}-{founder_cost})/{rev})",
            ).number_format = "0.0%"
            ws.cell(r, c0 + 10, f"={mrr}").number_format = '"$"#,##0'
            ws.cell(r, c0 + 11, f"={cogs}").number_format = '"$"#,##0'
            plat_cogs = f"{get_column_letter(c0 + 11)}{r}"
            ws.cell(r, c0 + 12, f"={get_column_letter(c0 + 10)}{r}+{rev}").number_format = '"$"#,##0'
            comb_rev = f"{get_column_letter(c0 + 12)}{r}"
            ws.cell(
                r,
                c0 + 13,
                f"={plat_cogs}-IF(AND({head}>=1,svc_reclass_csm>=1),{csm},0)+{cash}",
            ).number_format = '"$"#,##0'
            comb_cogs = f"{get_column_letter(c0 + 13)}{r}"
            ws.cell(r, c0 + 14, f"=IF({comb_rev}=0,NA(),({comb_rev}-{comb_cogs})/{comb_rev})").number_format = "0.0%"
            # Company cash OP: forecast cash OP already deducted platform cogs and opex.
            # Add service cash GP. If we reclass CSM, add that CSM back into profit because forecast OP had subtracted it.
            ws.cell(
                r,
                c0 + 15,
                f"={op}+{rev}-{cash}+IF(AND({head}>=1,svc_reclass_csm>=1),{csm},0)",
            ).number_format = '"$"#,##0'
            for c in range(16):
                ws.cell(r, c0 + c).font = Font(name="Calibri", size=10)

    total = 44
    ws.cell(total, 1, "Month 36 / sum")
    for b, c0 in enumerate(starts):
        ws.cell(total, c0 + 2, f"={get_column_letter(c0 + 2)}42").number_format = "0"
        ws.cell(total, c0 + 5, f"=SUM({get_column_letter(c0 + 5)}7:{get_column_letter(c0 + 5)}42)").number_format = '"$"#,##0'
        ws.cell(total, c0 + 8, f"=SUM({get_column_letter(c0 + 8)}7:{get_column_letter(c0 + 8)}42)").number_format = '"$"#,##0'
        ws.cell(total, c0 + 15, f"=SUM({get_column_letter(c0 + 15)}7:{get_column_letter(c0 + 15)}42)").number_format = '"$"#,##0'
        for i in range(16):
            ws.cell(total, c0 + i).fill = SECTION_FILL
            ws.cell(total, c0 + i).font = Font(bold=True)

    ws["A46"] = "Month-36 service revenue x 12 (run-rate, not the sum)"
    for b, c0 in enumerate(starts):
        cell = ws.cell(46, c0 + 5, f"={get_column_letter(c0 + 5)}42*12")
        cell.number_format = '"$"#,##0'
    ws["A47"] = "Month-36 combined cash margin"
    for b, c0 in enumerate(starts):
        cell = ws.cell(47, c0 + 14, f"={get_column_letter(c0 + 14)}42")
        cell.number_format = "0.0%"
    ws["A48"] = "Cumulative company cash operating profit"
    for b, c0 in enumerate(starts):
        cell = ws.cell(48, c0 + 15, f"=SUM({get_column_letter(c0 + 15)}7:{get_column_letter(c0 + 15)}42)")
        cell.number_format = '"$"#,##0'

    chart = LineChart()
    chart.title = "Combined cash gross margin"
    chart.y_axis.title = "Margin"
    chart.y_axis.scaling.min = 0
    chart.y_axis.scaling.max = 1
    chart.height = 8
    chart.width = 18
    chart.style = 10
    for c0 in starts:
        data = Reference(ws, min_col=c0 + 14, min_row=6, max_row=42)
        chart.add_data(data, titles_from_data=True)
    ws.add_chart(chart, "A50")
    ws.freeze_panes = "A7"
    ws.row_dimensions[6].height = 32
    for c0 in starts:
        for i, w in enumerate([10, 16, 10, 16, 16, 18, 20, 14, 18, 18, 16, 20, 18, 22, 18, 28]):
            ws.column_dimensions[get_column_letter(c0 + i)].width = w
    ws.column_dimensions["Q"].width = 3
    ws.column_dimensions["AH"].width = 3
    ws.sheet_properties.tabColor = "C65911"
    ws["A4"] = "Row 7 is month 1. Row 42 is month 36. Same months as Forecast36."
    ws["A4"].font = Font(italic=True, color="666666")


def _sensitivity(wb) -> None:
    ws = wb.create_sheet("ServiceSensitivity")
    ws["A1"] = "What breaks the service margin or the combined margin"
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:F1")
    ws["A2"] = "Each row is a one-variable illustration. It does not write back to ServiceAssumptions."
    for i, h in enumerate(["Case", "Hourly delivery cost", "Essential hours", "Essential price", "Essential loaded GM", "Note"], 1):
        ws.cell(4, i, h)
    _style_header(ws, 4, 6)
    cases = [
        ("Recommended Essential", "=svc_hour_cost", "=svc_essential_hours", "=svc_essential_price", "Full book"),
        ("Salary +20%", "=svc_hour_cost*1.2", "=svc_essential_hours", "=svc_essential_price", "On-cost or market pay"),
        ("Utilization 50%", "=svc_annual_loaded/(svc_nominal_hours*0.5)", "=svc_essential_hours", "=svc_essential_price", "Half-empty book, same salary"),
        ("Utilization 75%", "=svc_annual_loaded/(svc_nominal_hours*0.75)", "=svc_essential_hours", "=svc_essential_price", "Tighter scheduling"),
        ("Hours drift to 10", "=svc_hour_cost", 10, "=svc_essential_price", "Scope creep on Essential"),
        ("Discussed floor $2,500", "=svc_hour_cost", "=svc_essential_hours", 2500, "Fails the design target"),
        ("Payroll tax switched on", "=(svc_annual_loaded+svc_salary*(1+svc_super_rate)*svc_payroll_tax_rate)/svc_delivery_year", "=svc_essential_hours", "=svc_essential_price", "Once wages clear $1.3m"),
        ("Founder delivers", "=founder_opp_per_hour", "=svc_essential_hours", "=svc_essential_price", "Opportunity cost"),
        ("Contractor delivers", "=svc_contractor_hour", "=svc_essential_hours", "=svc_essential_price", "Not the design"),
        ("AI stress instead of 40 calls", "=svc_hour_cost", "=svc_essential_hours", "=svc_essential_price", "See column note on cost"),
    ]
    for i, (label, hour, hours, price, note) in enumerate(cases):
        r = 5 + i
        ws.cell(r, 1, label)
        ws.cell(r, 2, hour).number_format = '"$"#,##0.00'
        ws.cell(r, 3, hours).number_format = "0.0"
        ws.cell(r, 4, price).number_format = '"$"#,##0'
        extra = "svc_ai_per_customer"
        if label.startswith("AI stress"):
            extra = "(stress_completions*(stress_input_tokens/1000000*stress_price_in+stress_output_tokens/1000000*stress_price_out)*fx_aud_per_usd)"
        ws.cell(r, 5, f"=IF(D{r}=0,NA(),(D{r}-C{r}*B{r}-{extra})/D{r})").number_format = "0.0%"
        ws.cell(r, 6, note)
        for c in range(1, 7):
            ws.cell(r, c).border = THIN
            ws.cell(r, c).alignment = WRAP
    ws["A17"] = "Combined customer, collected platform, reclassified SaaS COGS, full-book service cost"
    ws["A17"].font = SECTION_FONT
    for i, h in enumerate(["Case", "Platform", "Service price", "Service hours", "SaaS COGS", "Combined GM"], 1):
        ws.cell(18, i, h)
    _style_header(ws, 18, 6)
    mix_cases = [
        ("Essential as recommended", "=hyp_mrr", "=svc_essential_price", "=svc_essential_hours", "=MarginMix!B14"),
        ("Advanced as recommended", "=hyp_mrr", "=svc_advanced_price", "=svc_advanced_hours", "=MarginMix!B14"),
        ("Strategic as recommended", "=hyp_mrr", "=svc_strategic_price", "=svc_strategic_hours", "=MarginMix!B14"),
        ("Strategic at $15,000 and 16 hours", "=hyp_mrr", 15000, "=svc_strategic_hours", "=MarginMix!B14"),
        ("Strategic at $15,000 and 30 hours", "=hyp_mrr", 15000, 30, "=MarginMix!B14"),
        ("Essential, but CSM left inside SaaS", "=hyp_mrr", "=svc_essential_price", "=svc_essential_hours", "=MarginMix!B12"),
        ("Platform price cut to $7,500 list, plus Essential", 7500, "=svc_essential_price", "=svc_essential_hours", "=MarginMix!B14"),
        ("Collected platform, Essential hours drift to 12", "=hyp_mrr", "=svc_essential_price", 12, "=MarginMix!B14"),
    ]
    for i, (label, plat, price, hours, saas) in enumerate(mix_cases):
        r = 19 + i
        ws.cell(r, 1, label)
        ws.cell(r, 2, plat).number_format = '"$"#,##0'
        ws.cell(r, 3, price).number_format = '"$"#,##0'
        ws.cell(r, 4, hours).number_format = "0.0"
        ws.cell(r, 5, saas).number_format = '"$"#,##0'
        ws.cell(
            r,
            6,
            f"=IF(B{r}+C{r}=0,NA(),(B{r}+C{r}-E{r}-(D{r}*svc_hour_cost+svc_ai_per_customer))/(B{r}+C{r}))",
        ).number_format = "0.0%"
        for c in range(1, 7):
            ws.cell(r, c).border = THIN
            ws.cell(r, c).alignment = WRAP
    ws["A29"] = (
        "SaaS gross margin on the reclassified line should stay well above 85%, because the human moved to the service invoice. "
        "Combined margin falls through 80% when Strategic hours are allowed to swell, when the CSM is kept inside SaaS as well, "
        "or when the platform is discounted back to the in-code production band and a service is stacked on it without a full book. "
        "The last of those still clears 80% in this sheet if the specialist is full. The danger is the empty salary, which ServiceScale prices and this table does not."
    )
    ws["A29"].alignment = WRAP
    ws.merge_cells("A29:F31")
    ws.column_dimensions["A"].width = 62
    for c in range(2, 7):
        ws.column_dimensions[get_column_letter(c)].width = 24
    ws.row_dimensions[4].height = 30
    ws.row_dimensions[18].height = 30
    ws.sheet_properties.tabColor = "C65911"


def add_managed_services(wb) -> None:
    _write_assumptions(wb)
    _package_sheet(wb)
    _scale_sheet(wb)
    _mix_sheet(wb)
    _forecast_sheet(wb)
    _sensitivity(wb)
    src = wb["Sources"]
    # Append after the existing source block. Find first empty row in column A from row 5.
    row = 5
    while src.cell(row, 1).value:
        row += 1
    extra = [
        (
            "Superannuation guarantee",
            "12% of ordinary time earnings from 1 July 2025, unchanged for 2026–27",
            "https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee/",
        ),
        (
            "Queensland payroll tax",
            "4.75% up to $6.5m Australian taxable wages. Threshold $1.3m. Not applied until the flag is on.",
            "https://qro.qld.gov.au/payroll-tax/calculate/rates-thresholds/",
        ),
        (
            "Managed intelligence labour",
            "Salary, workers comp, tools, utilization, and package prices are inputs, not citations.",
            "ServiceAssumptions yellow cells",
        ),
    ]
    for i, (a, b, c) in enumerate(extra):
        src.cell(row + i, 1, a)
        src.cell(row + i, 2, b).alignment = WRAP
        src.cell(row + i, 3, c).alignment = WRAP
        src.row_dimensions[row + i].height = 32
