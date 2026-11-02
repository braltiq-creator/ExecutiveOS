"""Regenerate the industrial unit-economics workbook.

This is not application code and it does not change billing.
Outputs are recommendations under editable assumptions, not approved prices.

    python3 docs/commercial/models/build_industrial_unit_economics.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from openpyxl import Workbook

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_managed_services import add_managed_services  # noqa: E402
from add_offer_architecture import add_offer_architecture  # noqa: E402
from add_reconciliation import add_reconciliation  # noqa: E402
from openpyxl.chart import LineChart, Reference
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName

OUT = Path(__file__).with_name("industrial_unit_economics.xlsx")

# RBA units of USD per AUD, 30 October 2026.
RBA_AUDUSD = 0.7040

NAVY = "1F4E79"
YELLOW = "FFF2CC"
BLUE_FONT = Font(name="Calibri", size=11, color="1F4E79", bold=True)
HEADER_FILL = PatternFill("solid", fgColor=NAVY)
HEADER_FONT = Font(name="Calibri", size=11, color="FFFFFF", bold=True)
SECTION_FILL = PatternFill("solid", fgColor="D6E3F0")
SECTION_FONT = Font(name="Calibri", size=12, bold=True, color=NAVY)
INPUT_FILL = PatternFill("solid", fgColor=YELLOW)
THIN = Border(
    left=Side(style="thin", color="D9D9D9"),
    right=Side(style="thin", color="D9D9D9"),
    top=Side(style="thin", color="D9D9D9"),
    bottom=Side(style="thin", color="D9D9D9"),
)
WRAP = Alignment(wrap_text=True, vertical="center")

# New-logo inputs. These are scenarios, not a demand forecast.
# Index 0 is month 1.
CONS_NEW = [0] * 36
for m in (9, 12, 16, 20, 24, 28, 32, 36):
    CONS_NEW[m - 1] = 1

BASE_NEW = [0] * 36
for m in (6, 9, 12, 15, 18, 20, 22, 24, 27, 29, 31, 33, 35):
    BASE_NEW[m - 1] = 1

AGG_NEW = [0] * 36
for m in (4, 7, 9, 11, 12, 14, 16, 18, 19, 21, 23, 25, 27, 28, 30, 32, 33, 35, 36):
    AGG_NEW[m - 1] = 1
AGG_NEW[20] = 2  # month 21 already 1; add a second in month 22 via list below
# Keep aggressive founder-led: 5 in year 1, then about one a month, not a sales machine.
AGG_NEW = [0] * 36
for m in (4, 7, 9, 11, 12):
    AGG_NEW[m - 1] = 1
for m in range(14, 25):
    if m % 2 == 0:
        AGG_NEW[m - 1] = 1
for m in range(25, 37):
    AGG_NEW[m - 1] = 1 if m % 2 else 1
# That last loop sets every month 25-36 to 1. Year 3 = 12 logos. Too hot.
# Reset year 3 to 8 logos.
for m in range(25, 37):
    AGG_NEW[m - 1] = 0
for m in (25, 27, 28, 30, 32, 33, 35, 36):
    AGG_NEW[m - 1] = 1


def inputs() -> list[tuple[str, float | int | str, str, str, str]]:
    """name, value, unit, kind, note."""
    aud_per_usd = 1 / RBA_AUDUSD
    return [
        ("section_fx", "FX AND CURRENCY", "", "section", ""),
        (
            "fx_aud_per_usd",
            round(aud_per_usd, 6),
            "AUD per 1 USD",
            "input",
            "1 / 0.7040. RBA AUDUSD 0.7040 on 30 Oct 2026. Replace when the rate moves.",
        ),
        (
            "rba_audusd",
            RBA_AUDUSD,
            "USD per 1 AUD",
            "source",
            "RBA statistical table, 30 October 2026. Not a forecast.",
        ),
        ("section_price", "WORKING PRICE HYPOTHESIS — NOT APPROVED", "", "section", ""),
        (
            "list_mrr",
            9500,
            "AUD / month",
            "input",
            "Recommended list for founder approval. Not a price in force. Sits between the code production band (7500) and the code enterprise list (15000).",
        ),
        (
            "annual_months_paid",
            11,
            "months paid per year",
            "input",
            "One month free on annual prepay. Not the unconfirmed 17% or the 20% encoded on the USD seat plans.",
        ),
        (
            "hyp_mrr",
            8708,
            "AUD / month collected",
            "input",
            "list_mrr x annual_months_paid / 12. The forecast uses this collected rate, because the industrial motion should default to annual invoice.",
        ),
        (
            "second_entity_mrr",
            3000,
            "AUD / month",
            "input",
            "Hypothesis for a second operating entity. Do not sell until the product supports a second tenant cleanly.",
        ),
        (
            "included_users",
            8,
            "users",
            "input",
            "Allowance, not the value metric. Extra users are an admin control, not the wedge.",
        ),
        (
            "included_completions",
            2000,
            "completions / month",
            "input",
            "Hard included allowance on the small model. Above this, overage or stop.",
        ),
        (
            "overage_multiple",
            4,
            "times vendor cost",
            "input",
            "Overage is priced so heavy AI use raises margin rather than consuming it.",
        ),
        ("section_ai", "AI COST — PUBLISHED OPENAI RATES", "", "section", ""),
        (
            "completions_per_customer",
            280,
            "completions / month",
            "input",
            "Base hypothesis: ~40 consultations x (3 agents x reason + recommend + 1 synthesis). Forecasting itself makes no model call.",
        ),
        ("input_tokens", 4000, "tokens / call", "input", "Unmeasured. Prompt size has not been metered in production."),
        ("output_tokens", 500, "tokens / call", "input", "Code caps reason at 700 and recommend at 600. 500 is a midpoint hypothesis."),
        (
            "price_in_usd_per_m",
            0.15,
            "USD / 1M input tokens",
            "source",
            "OpenAI gpt-4o-mini standard text price, developers.openai.com/api/docs/pricing, read 1 Nov 2026.",
        ),
        (
            "price_out_usd_per_m",
            0.60,
            "USD / 1M output tokens",
            "source",
            "Same source. Model is deprecated with API removal scheduled 14 Jan 2027; cited replacement gpt-6-luna is $0.10 / $0.50 short-context.",
        ),
        (
            "stress_completions",
            4400,
            "completions / month",
            "input",
            "Stress: 20 executives x 5 consults/week x 4 weeks x 11 calls. Not observed.",
        ),
        ("stress_input_tokens", 20000, "tokens / call", "input", "Long context stress. Not observed."),
        ("stress_output_tokens", 1000, "tokens / call", "input", "Above the current maxTokens caps. Tests a routing failure."),
        (
            "stress_price_in",
            2.50,
            "USD / 1M",
            "source",
            "OpenAI gpt-4o standard input, same pricing page. Used only as a wrong-model stress, not the base.",
        ),
        (
            "stress_price_out",
            10.0,
            "USD / 1M",
            "source",
            "OpenAI gpt-4o standard output, same pricing page.",
        ),
        ("section_infra", "INFRASTRUCTURE — PUBLISHED LIST, STEP HYPOTHESIS", "", "section", ""),
        (
            "vercel_pro_usd",
            20,
            "USD / month",
            "source",
            "Vercel Pro platform fee, vercel.com/docs/plans/pro-plan, read 1 Nov 2026. Includes $20 usage credit.",
        ),
        (
            "supabase_pro_usd",
            25,
            "USD / month",
            "source",
            "Supabase Pro organisation fee, supabase.com/pricing, read 1 Nov 2026.",
        ),
        (
            "supabase_micro_usd",
            10,
            "USD / month",
            "source",
            "Micro compute. Covered by the $10 Pro credit for one project.",
        ),
        (
            "supabase_credit_usd",
            10,
            "USD / month",
            "source",
            "Pro/Team compute credit. Covers one Micro instance.",
        ),
        ("supabase_small_usd", 15, "USD / month", "source", "Small compute list price."),
        ("supabase_medium_usd", 60, "USD / month", "source", "Medium compute list price."),
        ("supabase_large_usd", 110, "USD / month", "source", "Large compute list price."),
        (
            "n_small",
            11,
            "customers",
            "input",
            "HYPOTHESIS of when to leave Micro. Not measured. No production load test is in the repo.",
        ),
        ("n_medium", 25, "customers", "input", "HYPOTHESIS. Replace with observed CPU, disk, and connection counts."),
        ("n_large", 50, "customers", "input", "HYPOTHESIS."),
        ("section_people", "DELIVERY TIME — HYPOTHESIS, NOT A PAYROLL RECORD", "", "section", ""),
        (
            "founder_opp_per_hour",
            250,
            "AUD / hour",
            "input",
            "Opportunity cost for fully loaded margin. Cash cost of founder hours is zero until a hire replaces them.",
        ),
        (
            "support_rate",
            90,
            "AUD / hour",
            "input",
            "Loaded cost of a paid support hour once that role exists. Cash is zero while the founder absorbs it.",
        ),
        (
            "support_hours",
            1,
            "hours / customer / month",
            "input",
            "Cap. Above this, the account is off-ICP or the product is failing.",
        ),
        (
            "founder_steady_hours",
            4,
            "hours / customer / month",
            "input",
            "Steady-state founder delivery BEFORE a CSM. Must fall to zero once a CSM is paid, or margin is double-counted.",
        ),
        (
            "csm_annual_loaded",
            180000,
            "AUD / year",
            "input",
            "Fully loaded Australian CSM hypothesis. Not a job offer.",
        ),
        ("customers_per_csm", 15, "customers", "input", "Hypothesis. CEO playbook used 15 paying orgs as the CS hire gate."),
        (
            "csm_hire_at",
            15,
            "customers",
            "input",
            "Do not hire ahead of this. Founder delivery is the year-1 model.",
        ),
        ("onboarding_hours", 12, "hours / new customer", "input", "Hard cap for a repeatable file-based pilot. Bespoke work is a disqualifier."),
        (
            "onboarding_cash_rate",
            0,
            "AUD / hour",
            "input",
            "Zero while the founder does it. Set to a contractor rate when onboarding is paid for.",
        ),
        ("section_pay", "PAYMENTS", "", "section", ""),
        (
            "card_share",
            0.0,
            "fraction of MRR",
            "input",
            "Industrial hypothesis is annual invoice, not card. Set to 1 to test monthly card billing.",
        ),
        (
            "card_rate",
            0.0165,
            "fraction",
            "source",
            "Stripe Australia domestic online cards 1.65% + A$0.30, stripe.com/au/pricing, read 1 Nov 2026. Fees include GST.",
        ),
        ("card_fixed_aud", 0.30, "AUD / charge", "source", "Same Stripe Australia page. One charge per customer per month if card_share > 0."),
        ("section_opex", "COMPANY OVERHEAD — HYPOTHESIS", "", "section", ""),
        ("founder_salary", 180000, "AUD / year", "input", "Cash salary hypothesis. Unknown in the repo. Requires founder approval."),
        (
            "engineer_loaded",
            220000,
            "AUD / year",
            "input",
            "One fully loaded engineer. The product already exists; this is the cost of keeping one builder.",
        ),
        ("ga_annual", 60000, "AUD / year", "input", "Accounting, insurance, legal retainer, internal tools. Not measured."),
        ("sm_cash_annual", 24000, "AUD / year", "input", "Travel and sales tools. No paid media in the base."),
        ("ae_loaded", 180000, "AUD / year", "input", "Used only in the aggressive case, and only from ae_start_month."),
        ("ae_start_month", 18, "month", "input", "Aggressive case only. Do not hire on the conservative or base path inside 36 months."),
        ("section_acq", "ACQUISITION", "", "section", ""),
        ("hours_per_opp", 15, "hours", "input", "Discovery, demo, pilot admin, procurement. Hypothesis."),
        ("opps_per_win", 5, "opportunities", "input", "20% win rate. NOT observed. Sensitivity uses 10."),
        ("cash_cac", 2500, "AUD / win", "input", "Travel plus a standard contract review. No events budget in the base."),
        ("commission_rate", 0.0, "fraction of year-1 ACV", "input", "No partners in the initial motion."),
        ("section_churn", "SCENARIO RATES", "", "section", ""),
        ("churn_cons", 0.15, "annual logo churn", "input", "Harsh on purpose. No cohort exists."),
        ("churn_base", 0.10, "annual logo churn", "input", "Unobserved."),
        ("churn_agg", 0.08, "annual logo churn", "input", "Still unobserved. Not a target to manage toward."),
        ("expand_cons", 0.0, "share of logos", "input", "No second-entity expansion in the conservative case."),
        ("expand_base", 0.10, "share of logos", "input", "Applied from month 13 only."),
        ("expand_agg", 0.15, "share of logos", "input", "Applied from month 13 only."),
        (
            "pilot_fee",
            12000,
            "AUD",
            "input",
            "1 November hypothesis. Not read by Forecast36. The 2 November reconciliation uses arch_pilot_fee of 15000 on the order sheets. This cell is left at 12000 so the earlier figure is not overwritten.",
        ),
        ("free_partner_cap", 3, "accounts", "input", "Maximum zero-fee design partners."),
        ("free_partner_hours", 15, "hours", "input", "Cap per free design partner."),
    ]


def style_header(ws, row: int, cols: int) -> None:
    for col in range(1, cols + 1):
        cell = ws.cell(row, col)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = WRAP


def autosize(ws, widths: dict[int, int]) -> None:
    for col, width in widths.items():
        ws.column_dimensions[get_column_letter(col)].width = width


def build() -> dict[str, float]:
    wb = Workbook()
    assumptions = wb.active
    assumptions.title = "Assumptions"

    assumptions["A1"] = "Key"
    assumptions["B1"] = "Value"
    assumptions["C1"] = "Unit"
    assumptions["D1"] = "Kind"
    assumptions["E1"] = "Source or note"
    style_header(assumptions, 1, 5)
    assumptions.row_dimensions[1].height = 22
    assumptions.freeze_panes = "A2"
    assumptions.auto_filter.ref = "A1:E200"

    names: dict[str, int] = {}
    for offset, (name, value, unit, kind, note) in enumerate(inputs(), start=2):
        names[name] = offset
        assumptions.cell(offset, 1, name).font = Font(name="Calibri", size=10)
        cell = assumptions.cell(offset, 2, value if kind != "section" else None)
        assumptions.cell(offset, 3, unit)
        assumptions.cell(offset, 4, kind)
        assumptions.cell(offset, 5, note).alignment = WRAP
        if kind == "section":
            for col in range(1, 6):
                assumptions.cell(offset, col).fill = SECTION_FILL
                assumptions.cell(offset, col).font = SECTION_FONT
        elif kind == "input":
            cell.fill = INPUT_FILL
            cell.font = BLUE_FONT
            cell.border = THIN
        else:
            cell.font = Font(name="Calibri", size=11)
            cell.border = THIN
        if isinstance(value, float) and value < 1:
            cell.number_format = "0.00%"
            if name in {"fx_aud_per_usd", "rba_audusd", "price_in_usd_per_m", "price_out_usd_per_m", "stress_price_in", "stress_price_out", "card_fixed_aud"}:
                cell.number_format = "0.0000"
        elif isinstance(value, (int, float)):
            cell.number_format = "#,##0.00" if isinstance(value, float) else "#,##0"
        assumptions.row_dimensions[offset].height = 32
        if kind != "section":
            wb.defined_names.add(DefinedName(name, attr_text=f"Assumptions!$B${offset}"))

    # Collected rate stays tied to list and the annual concession.
    hyp_row = names["hyp_mrr"]
    assumptions.cell(
        hyp_row,
        2,
        f"=B{names['list_mrr']}*B{names['annual_months_paid']}/12",
    )
    assumptions.cell(hyp_row, 2).number_format = '"$"#,##0.00'
    assumptions.cell(hyp_row, 2).fill = PatternFill("solid", fgColor="E2EFDA")
    assumptions.cell(hyp_row, 4, "formula")

    assumptions["A70"] = "How to use this sheet"
    assumptions["A71"] = (
        "Yellow cells with blue type are inputs. Change only those. "
        "Every other sheet is formulas. Nothing on this workbook is an approved price, "
        "headcount plan, or forecast. Kind = source means a published vendor price read on 1 November 2026."
    )
    assumptions.merge_cells("A71:E73")
    assumptions["A71"].alignment = WRAP
    autosize(assumptions, {1: 32, 2: 18, 3: 28, 4: 12, 5: 88})

    def ref(name: str) -> str:
        return name  # defined names

    # ----- Unit economics -----
    unit = wb.create_sheet("UnitEconomics")
    unit["A1"] = "Customer-level economics under the working price hypothesis and the conflicting books"
    unit["A1"].font = SECTION_FONT
    unit.merge_cells("A1:H1")
    unit["A2"] = (
        "Block A allocates the whole platform to one customer and uses founder time, no CSM. "
        "Block B is the mature shape: 25 customers, one CSM, founder delivery hours at zero. "
        "Gross margin here is a delivery margin. Acquisition cost is not in it. "
        "Operating profit is on the Forecast sheet."
    )
    unit["A2"].alignment = WRAP
    unit.merge_cells("A2:H3")
    unit.row_dimensions[2].height = 20
    unit.row_dimensions[3].height = 20

    prices = [
        ("Recommended list", f"={ref('list_mrr')}"),
        ("Commercial library Individual", 495),
        ("Commercial library Team", 1995),
        ("Code pilot band", 4500),
        ("Code production band", 7500),
        ("Code enterprise list", 15000),
    ]
    unit["A5"] = "Monthly price (AUD)"
    for i, (label, price) in enumerate(prices):
        col = 2 + i
        unit.cell(4, col, label)
        cell = unit.cell(5, col, price)
        cell.number_format = '"$"#,##0'
        if isinstance(price, str):
            cell.font = BLUE_FONT
    style_header(unit, 4, 7)

    # Helper formulas reused
    # AI per customer AUD base
    ai_one = (
        f"={ref('completions_per_customer')}*("
        f"{ref('input_tokens')}/1000000*{ref('price_in_usd_per_m')}+"
        f"{ref('output_tokens')}/1000000*{ref('price_out_usd_per_m')}"
        f")*{ref('fx_aud_per_usd')}"
    )
    ai_stress = (
        f"={ref('stress_completions')}*("
        f"{ref('stress_input_tokens')}/1000000*{ref('stress_price_in')}+"
        f"{ref('stress_output_tokens')}/1000000*{ref('stress_price_out')}"
        f")*{ref('fx_aud_per_usd')}"
    )

    def infra_usd(n_expr: str) -> str:
        return (
            f"({ref('vercel_pro_usd')}+{ref('supabase_pro_usd')}+"
            f"IF({n_expr}>={ref('n_large')},{ref('supabase_large_usd')},"
            f"IF({n_expr}>={ref('n_medium')},{ref('supabase_medium_usd')},"
            f"IF({n_expr}>={ref('n_small')},{ref('supabase_small_usd')},{ref('supabase_micro_usd')})))"
            f"-{ref('supabase_credit_usd')})"
        )

    rows = {
        7: ("ARR", lambda col: f"={get_column_letter(col)}5*12"),
        8: ("AI, base case, AUD / month", lambda col: ai_one),
        9: ("AI, wrong-model stress, AUD / month", lambda col: ai_stress),
        11: ("BLOCK A — one customer, founder-delivered", None),
        12: ("Platform infra allocated to this customer (AUD)", lambda col: f"={infra_usd('1')}*{ref('fx_aud_per_usd')}"),
        13: ("Card fees (AUD)", lambda col: f"={get_column_letter(col)}5*{ref('card_share')}*{ref('card_rate')}+{ref('card_share')}*{ref('card_fixed_aud')}"),
        14: ("Founder delivery opportunity cost (AUD)", lambda col: f"={ref('founder_steady_hours')}*{ref('founder_opp_per_hour')}"),
        15: ("Paid support cash (AUD)", lambda col: f"={ref('support_hours')}*{ref('support_rate')}"),
        16: ("Cash COGS (infra + AI + fees + paid support)", lambda col: f"={get_column_letter(col)}12+{get_column_letter(col)}8+{get_column_letter(col)}13+{get_column_letter(col)}15"),
        17: ("Cash gross profit", lambda col: f"={get_column_letter(col)}5-{get_column_letter(col)}16"),
        18: ("Cash gross margin", lambda col: f"=IF({get_column_letter(col)}5=0,NA(),{get_column_letter(col)}17/{get_column_letter(col)}5)"),
        19: ("Fully loaded COGS (adds founder time)", lambda col: f"={get_column_letter(col)}16+{get_column_letter(col)}14"),
        20: ("Fully loaded gross profit", lambda col: f"={get_column_letter(col)}5-{get_column_letter(col)}19"),
        21: ("Fully loaded gross margin", lambda col: f"=IF({get_column_letter(col)}5=0,NA(),{get_column_letter(col)}20/{get_column_letter(col)}5)"),
        22: ("Fully loaded margin if AI stress replaces base AI", lambda col: f"=IF({get_column_letter(col)}5=0,NA(),({get_column_letter(col)}5-({get_column_letter(col)}19-{get_column_letter(col)}8+{get_column_letter(col)}9))/{get_column_letter(col)}5)"),
        24: ("BLOCK B — mature, N=25, one CSM, founder delivery = 0", None),
        25: ("Infra allocated per customer (AUD)", lambda col: f"={infra_usd('25')}*{ref('fx_aud_per_usd')}/25"),
        26: ("CSM allocated (AUD)", lambda col: f"=ROUNDUP(25/{ref('customers_per_csm')},0)*{ref('csm_annual_loaded')}/12/25"),
        27: ("Cash COGS", lambda col: f"={get_column_letter(col)}25+{get_column_letter(col)}8+{get_column_letter(col)}13+{get_column_letter(col)}15+{get_column_letter(col)}26"),
        28: ("Cash gross margin", lambda col: f"=IF({get_column_letter(col)}5=0,NA(),({get_column_letter(col)}5-{get_column_letter(col)}27)/{get_column_letter(col)}5)"),
        29: ("First-year onboarding opportunity cost (AUD)", lambda col: f"={ref('onboarding_hours')}*{ref('founder_opp_per_hour')}"),
        30: ("First-year fully loaded margin (CSM in the run-rate, onboarding once)", lambda col: f"=IF({get_column_letter(col)}7=0,NA(),({get_column_letter(col)}7-({get_column_letter(col)}27*12)-{get_column_letter(col)}29)/{get_column_letter(col)}7)"),
        32: ("Clears 80% mature cash margin?", lambda col: f'=IF({get_column_letter(col)}28>=0.8,"Yes","No")'),
        33: ("Clears 85% mature cash margin?", lambda col: f'=IF({get_column_letter(col)}28>=0.85,"Yes","No")'),
        34: ("Clears 80% mature fully loaded first year?", lambda col: f'=IF({get_column_letter(col)}30>=0.8,"Yes","No")'),
    }

    for row, (label, formula) in rows.items():
        unit.cell(row, 1, label).alignment = WRAP
        if formula is None:
            for col in range(1, 8):
                unit.cell(row, col).fill = SECTION_FILL
                unit.cell(row, col).font = SECTION_FONT
            continue
        for col in range(2, 8):
            cell = unit.cell(row, col, formula(col))
            cell.border = THIN
            if row in {18, 21, 22, 28, 30}:
                cell.number_format = "0.0%"
            elif row >= 32:
                cell.alignment = Alignment(horizontal="center")
            else:
                cell.number_format = '"$"#,##0.00'

    unit["A36"] = (
        "Cash gross margin treats founder hours as free. Fully loaded gross margin prices those hours at founder_opp_per_hour. "
        "The 80–85% target is applied to both, on purpose. A price that only works when founder time is free will fail when a CSM is hired "
        "unless founder delivery on steady-state accounts stops."
    )
    unit["A36"].alignment = WRAP
    unit.merge_cells("A36:G38")
    unit.row_dimensions[36].height = 18
    unit.freeze_panes = "B5"
    autosize(unit, {1: 78, 2: 22, 3: 24, 4: 22, 5: 20, 6: 22, 7: 22})
    for r in range(5, 35):
        unit.row_dimensions[r].height = 18
    unit.row_dimensions[11].height = 22
    unit.row_dimensions[24].height = 22

    # ----- Scale -----
    scale = wb.create_sheet("Scale")
    scale["A1"] = "Company delivery cost at 1, 5, 10, 25, 50 and 100 customers"
    scale["A1"].font = SECTION_FONT
    scale["A2"] = "Uses the working price hypothesis only. Fixed infrastructure is charged once. CSM cost steps in at csm_hire_at."
    scale["A2"].alignment = WRAP
    scale.merge_cells("A2:L2")
    headers = [
        "Customers",
        "MRR",
        "ARR",
        "Infra",
        "AI base",
        "AI stress",
        "Card fees",
        "Paid support",
        "CSM cash",
        "Founder delivery (opp.)",
        "Onboarding opp. if all were new",
        "Cash COGS",
        "Cash gross margin",
        "Fully loaded COGS",
        "Fully loaded gross margin",
        "First-year fully loaded margin if this cohort was all new",
    ]
    for i, h in enumerate(headers, 1):
        scale.cell(4, i, h)
    style_header(scale, 4, len(headers))
    counts = [1, 5, 10, 25, 50, 100]
    for i, n in enumerate(counts):
        r = 5 + i
        scale.cell(r, 1, n).number_format = "0"
        scale.cell(r, 2, f"=A{r}*{ref('hyp_mrr')}").number_format = '"$"#,##0'
        scale.cell(r, 3, f"=B{r}*12").number_format = '"$"#,##0'
        scale.cell(r, 4, f"={infra_usd(f'A{r}')}*{ref('fx_aud_per_usd')}").number_format = '"$"#,##0'
        scale.cell(r, 5, f"=A{r}*{ai_one[1:]}").number_format = '"$"#,##0'
        scale.cell(r, 6, f"=A{r}*{ai_stress[1:]}").number_format = '"$"#,##0'
        scale.cell(r, 7, f"=B{r}*{ref('card_share')}*{ref('card_rate')}+A{r}*{ref('card_share')}*{ref('card_fixed_aud')}").number_format = '"$"#,##0'
        scale.cell(r, 8, f"=A{r}*{ref('support_hours')}*{ref('support_rate')}").number_format = '"$"#,##0'
        scale.cell(
            r,
            9,
            f'=IF(A{r}>={ref("csm_hire_at")},ROUNDUP(A{r}/{ref("customers_per_csm")},0)*{ref("csm_annual_loaded")}/12,0)',
        ).number_format = '"$"#,##0'
        scale.cell(
            r,
            10,
            f'=IF(A{r}>={ref("csm_hire_at")},0,A{r}*{ref("founder_steady_hours")}*{ref("founder_opp_per_hour")})',
        ).number_format = '"$"#,##0'
        scale.cell(r, 11, f"=A{r}*{ref('onboarding_hours')}*{ref('founder_opp_per_hour')}").number_format = '"$"#,##0'
        # Cash COGS = infra + base AI + fees + paid support + CSM. Founder time excluded.
        # Paid support is included as cash because the rate is a paid-role rate. At N=1 the founder
        # may still do it; that double count is avoided by the note: set support_rate to 0
        # if the founder is the only person and those hours are already in column J.
        scale.cell(r, 12, f"=D{r}+E{r}+G{r}+H{r}+I{r}").number_format = '"$"#,##0'
        scale.cell(r, 13, f"=IF(B{r}=0,NA(),(B{r}-L{r})/B{r})").number_format = "0.0%"
        scale.cell(r, 14, f"=L{r}+J{r}").number_format = '"$"#,##0'
        scale.cell(r, 15, f"=IF(B{r}=0,NA(),(B{r}-N{r})/B{r})").number_format = "0.0%"
        scale.cell(r, 16, f"=IF(C{r}=0,NA(),(C{r}-L{r}*12-K{r})/C{r})").number_format = "0.0%"
        for c in range(1, 17):
            scale.cell(r, c).border = THIN
            scale.cell(r, c).font = Font(name="Calibri", size=11)

    scale["A12"] = (
        "Column H (paid support) uses support_rate even at one customer. If the founder is doing that hour, "
        "set support_rate to 0 on Assumptions so it is not counted twice with founder delivery. "
        "Column K is a one-off if every logo in the row was onboarded this year. It is not a monthly cost. "
        "Column P therefore applies onboarding once against annual revenue."
    )
    scale["A12"].alignment = WRAP
    scale.merge_cells("A12:P14")
    scale.row_dimensions[12].height = 20
    scale.freeze_panes = "B5"
    for i, w in enumerate([14, 16, 16, 14, 14, 14, 14, 16, 14, 26, 32, 14, 20, 20, 26, 42], 1):
        scale.column_dimensions[get_column_letter(i)].width = w
    scale.row_dimensions[4].height = 36
    scale.auto_filter.ref = "A4:P10"

    # ----- Acquisition -----
    acq = wb.create_sheet("Acquisition")
    acq["A1"] = "Acquisition arithmetic under stated assumptions"
    acq["A1"].font = SECTION_FONT
    acq["A3"] = "Item"
    acq["B3"] = "Value"
    style_header(acq, 3, 2)
    acq_rows = [
        (4, "Fully loaded hours per win", f"={ref('hours_per_opp')}*{ref('opps_per_win')}"),
        (5, "Opportunity-cost CAC (AUD)", f"=B4*{ref('founder_opp_per_hour')}"),
        (6, "Cash CAC (AUD)", f"={ref('cash_cac')}"),
        (7, "Commission (AUD)", f"={ref('hyp_mrr')}*12*{ref('commission_rate')}"),
        (8, "Year-1 ACV at hypothesis (AUD)", f"={ref('hyp_mrr')}*12"),
        (9, "Mature monthly cash gross profit at N=25 (AUD)", "=UnitEconomics!B5-UnitEconomics!B27"),
        (10, "Cash payback (months)", "=IF(B9<=0,NA(),(B6+B7)/B9)"),
        (11, "Fully loaded payback (months)", "=IF(B9<=0,NA(),(B5+B6+B7)/B9)"),
        (12, "Monthly logo churn, base", f"=1-(1-{ref('churn_base')})^(1/12)"),
        (13, "Implied LTV, cash gross profit / monthly churn (AUD)", "=IF(B12<=0,NA(),B9/B12)"),
        (14, "LTV : fully loaded CAC", "=IF((B5+B6+B7)=0,NA(),B13/(B5+B6+B7))"),
        (15, "Free design-partner opportunity cost, one account", f"={ref('free_partner_hours')}*{ref('founder_opp_per_hour')}"),
        (16, "Free design-partner opportunity cost at the cap", f"=B15*{ref('free_partner_cap')}"),
    ]
    for row, label, formula in acq_rows:
        acq.cell(row, 1, label)
        cell = acq.cell(row, 2, formula)
        cell.font = Font(name="Calibri", size=11)
        if row in {4}:
            cell.number_format = "0.0"
        elif row in {10, 11, 14}:
            cell.number_format = "0.0"
        elif row == 12:
            cell.number_format = "0.00%"
        else:
            cell.number_format = '"$"#,##0'
    acq["A18"] = (
        "LTV:CAC above looks extreme because cash CAC is a plane ticket and the denominator of LTV assumes the base churn forever "
        "and the N=25 cash gross profit on day one. It is arithmetic, not evidence. Use Sensitivity before quoting a ratio. "
        "A free design partner is a research cost, not a priced product."
    )
    acq["A18"].alignment = WRAP
    acq.merge_cells("A18:B20")
    autosize(acq, {1: 72, 2: 22})

    # ----- 36 month forecast -----
    fc = wb.create_sheet("Forecast36")
    fc["A1"] = "36-month scenarios. New-logo cells in yellow are inputs. Everything else is a formula."
    fc["A1"].font = SECTION_FONT
    fc.merge_cells("A1:N1")
    fc["A2"] = (
        "Logos are not Hitachi and not a pipeline. Churn applies to opening logos. "
        "Second-entity expansion starts in month 13 at the scenario share. "
        "Cash operating profit = MRR − cash delivery − cash onboarding − cash overhead. "
        "Fully loaded operating profit also subtracts founder delivery time and onboarding opportunity cost. "
        "An AE is added only on the aggressive path, from ae_start_month."
    )
    fc["A2"].alignment = WRAP
    fc.merge_cells("A2:N3")
    fc.row_dimensions[2].height = 22
    fc.row_dimensions[3].height = 22

    # Three side-by-side blocks of 12 columns, starting at row 5.
    # Layout per scenario: 13 columns
    # 1 new, 2 opening, 3 churned, 4 ending, 5 MRR, 6 infra, 7 variable cash cogs,
    # 8 csm, 9 cash cogs, 10 cash opex, 11 cash OP, 12 founder opp, 13 loaded OP
    block_titles = ["Conservative", "Base", "Aggressive"]
    new_lists = [CONS_NEW, BASE_NEW, AGG_NEW]
    churn_names = ["churn_cons", "churn_base", "churn_agg"]
    expand_names = ["expand_cons", "expand_base", "expand_agg"]
    start_cols = [1, 15, 29]

    def col(c: int) -> str:
        return get_column_letter(c)

    for b, title in enumerate(block_titles):
        c0 = start_cols[b]
        fc.cell(5, c0, title).font = HEADER_FONT
        fc.cell(5, c0).fill = HEADER_FILL
        headers_b = [
            "New logos",
            "Opening",
            "Churned",
            "Ending",
            "MRR",
            "Infra",
            "AI+fees+support",
            "CSM",
            "Cash COGS",
            "Cash overhead",
            "Cash operating profit",
            "Founder delivery + onboarding opp.",
            "Fully loaded operating profit",
        ]
        for i, h in enumerate(headers_b):
            cell = fc.cell(6, c0 + i, h)
            cell.fill = HEADER_FILL
            cell.font = HEADER_FONT
            cell.alignment = WRAP
        fc.row_dimensions[6].height = 32
        for m in range(1, 37):
            r = 6 + m
            new_cell = fc.cell(r, c0, new_lists[b][m - 1])
            new_cell.fill = INPUT_FILL
            new_cell.font = BLUE_FONT
            new_cell.number_format = "0"
            if m == 1:
                fc.cell(r, c0 + 1, 0)
            else:
                fc.cell(r, c0 + 1, f"={col(c0+3)}{r-1}")
            fc.cell(r, c0 + 1).number_format = "0.00"
            # churned
            fc.cell(
                r,
                c0 + 2,
                f"={col(c0+1)}{r}*(1-(1-{ref(churn_names[b])})^(1/12))",
            ).number_format = "0.00"
            fc.cell(r, c0 + 3, f"=MAX(0,{col(c0+1)}{r}+{col(c0)}{r}-{col(c0+2)}{r})").number_format = "0.00"
            # MRR with expansion from month 13
            fc.cell(
                r,
                c0 + 4,
                f"={col(c0+3)}{r}*{ref('hyp_mrr')}+IF({m}>=13,{col(c0+3)}{r}*{ref(expand_names[b])}*{ref('second_entity_mrr')},0)",
            ).number_format = '"$"#,##0'
            nref = f"{col(c0+3)}{r}"
            fc.cell(r, c0 + 5, f"=IF({nref}=0,{infra_usd('1')}*{ref('fx_aud_per_usd')},{infra_usd(nref)}*{ref('fx_aud_per_usd')})").number_format = '"$"#,##0'
            fc.cell(
                r,
                c0 + 6,
                f"={nref}*({ai_one[1:]})+{col(c0+4)}{r}*{ref('card_share')}*{ref('card_rate')}+{nref}*{ref('card_share')}*{ref('card_fixed_aud')}+{nref}*{ref('support_hours')}*{ref('support_rate')}",
            ).number_format = '"$"#,##0'
            fc.cell(
                r,
                c0 + 7,
                f'=IF({nref}>={ref("csm_hire_at")},ROUNDUP({nref}/{ref("customers_per_csm")},0)*{ref("csm_annual_loaded")}/12,0)',
            ).number_format = '"$"#,##0'
            fc.cell(r, c0 + 8, f"={col(c0+5)}{r}+{col(c0+6)}{r}+{col(c0+7)}{r}").number_format = '"$"#,##0'
            ae = (
                f'+IF({m}>={ref("ae_start_month")},{ref("ae_loaded")}/12,0)'
                if title == "Aggressive"
                else ""
            )
            fc.cell(
                r,
                c0 + 9,
                f"=({ref('founder_salary')}+{ref('engineer_loaded')}+{ref('ga_annual')}+{ref('sm_cash_annual')})/12{ae}",
            ).number_format = '"$"#,##0'
            fc.cell(r, c0 + 10, f"={col(c0+4)}{r}-{col(c0+8)}{r}-{col(c0)}{r}*{ref('onboarding_hours')}*{ref('onboarding_cash_rate')}-{col(c0+9)}{r}").number_format = '"$"#,##0'
            fc.cell(
                r,
                c0 + 11,
                f'=IF({nref}>={ref("csm_hire_at")},0,{nref}*{ref("founder_steady_hours")}*{ref("founder_opp_per_hour")})+{col(c0)}{r}*{ref("onboarding_hours")}*{ref("founder_opp_per_hour")}',
            ).number_format = '"$"#,##0'
            fc.cell(r, c0 + 12, f"={col(c0+10)}{r}-{col(c0+11)}{r}").number_format = '"$"#,##0'

    # Month index on the far left is inside each block as row number. Add a month column note in row 6 via comment in A? 
    # Put month numbers in a narrow way: insert isn't easy now. Add column before? 
    # I'll write month numbers into a row header by using the row: data starts row 7 = month 1.
    fc["A4"] = "Row 7 is month 1 (a hypothetical start, not a calendar date). Row 42 is month 36."
    fc["A4"].font = Font(italic=True, color="666666")

    # Totals
    total_row = 44
    fc.cell(total_row, 1, "Sum / end")
    for b in range(3):
        c0 = start_cols[b]
        fc.cell(total_row, c0, f"=SUM({col(c0)}7:{col(c0)}42)").number_format = "0.0"
        fc.cell(total_row, c0 + 3, f"={col(c0+3)}42").number_format = "0.00"
        fc.cell(total_row, c0 + 4, f"=SUM({col(c0+4)}7:{col(c0+4)}42)").number_format = '"$"#,##0'
        fc.cell(total_row, c0 + 10, f"=SUM({col(c0+10)}7:{col(c0+10)}42)").number_format = '"$"#,##0'
        fc.cell(total_row, c0 + 12, f"=SUM({col(c0+12)}7:{col(c0+12)}42)").number_format = '"$"#,##0'
        for i in range(13):
            fc.cell(total_row, c0 + i).font = Font(bold=True)
            fc.cell(total_row, c0 + i).fill = SECTION_FILL

    fc.cell(46, 1, "Ending ARR (month-36 MRR x 12)")
    fc["C46"] = f"={col(start_cols[0]+4)}42*12"
    fc["Q46"] = f"={col(start_cols[1]+4)}42*12"
    fc["AE46"] = f"={col(start_cols[2]+4)}42*12"
    for coord in ("C46", "Q46", "AE46"):
        fc[coord].number_format = '"$"#,##0'
    fc["B46"] = "Conservative"
    fc["P46"] = "Base"
    fc["AD46"] = "Aggressive"

    fc.cell(47, 1, "Cumulative cash operating profit")
    fc["C47"] = f"=SUM({col(start_cols[0]+10)}7:{col(start_cols[0]+10)}42)"
    fc["Q47"] = f"=SUM({col(start_cols[1]+10)}7:{col(start_cols[1]+10)}42)"
    fc["AE47"] = f"=SUM({col(start_cols[2]+10)}7:{col(start_cols[2]+10)}42)"
    for coord in ("C47", "Q47", "AE47"):
        fc[coord].number_format = '"$"#,##0'

    fc.freeze_panes = "A7"
    fc.auto_filter.ref = "A6:AM42"
    for b in range(3):
        c0 = start_cols[b]
        for i, w in enumerate([12, 12, 12, 12, 14, 12, 18, 12, 14, 16, 22, 28, 28]):
            fc.column_dimensions[get_column_letter(c0 + i)].width = w
    # gap columns
    fc.column_dimensions["N"].width = 3
    fc.column_dimensions["AB"].width = 3

    chart = LineChart()
    chart.title = "Cash operating profit by scenario"
    chart.y_axis.title = "AUD / month"
    chart.x_axis.title = "Month"
    chart.height = 8
    chart.width = 18
    chart.style = 10
    # Plot cash OP columns: conservative col 11, base col 25, aggressive col 39
    for c0, name in zip(start_cols, block_titles):
        data = Reference(fc, min_col=c0 + 10, min_row=6, max_row=42)
        chart.add_data(data, titles_from_data=True)
    chart.shape = 4
    fc.add_chart(chart, "A49")

    # ----- Sensitivity -----
    sens = wb.create_sheet("Sensitivity")
    sens["A1"] = "What moves mature cash gross margin at the hypothesis price, N=25"
    sens["A1"].font = SECTION_FONT
    sens["A2"] = "Each row changes one input relative to Assumptions and recomputes cash COGS. It does not write back to Assumptions."
    sens["A2"].alignment = WRAP
    sens.merge_cells("A2:F2")
    for i, h in enumerate(["Case", "MRR", "Completions / customer", "Support hours", "CSM annual loaded", "Cash gross margin"], 1):
        sens.cell(4, i, h)
    style_header(sens, 4, 6)

    # Base references
    cases = [
        ("Base hypothesis", f"={ref('hyp_mrr')}", f"={ref('completions_per_customer')}", f"={ref('support_hours')}", f"={ref('csm_annual_loaded')}"),
        ("AI completions x5", f"={ref('hyp_mrr')}", f"={ref('completions_per_customer')}*5", f"={ref('support_hours')}", f"={ref('csm_annual_loaded')}"),
        ("Wrong model (gpt-4o rates, stress volume)", f"={ref('hyp_mrr')}", f"={ref('stress_completions')}", f"={ref('support_hours')}", f"={ref('csm_annual_loaded')}"),
        ("Support 4 hours", f"={ref('hyp_mrr')}", f"={ref('completions_per_customer')}", 4, f"={ref('csm_annual_loaded')}"),
        ("Support 8 hours", f"={ref('hyp_mrr')}", f"={ref('completions_per_customer')}", 8, f"={ref('csm_annual_loaded')}"),
        ("CSM loaded +50%", f"={ref('hyp_mrr')}", f"={ref('completions_per_customer')}", f"={ref('support_hours')}", f"={ref('csm_annual_loaded')}*1.5"),
        ("Price cut to code pilot band", 4500, f"={ref('completions_per_customer')}", f"={ref('support_hours')}", f"={ref('csm_annual_loaded')}"),
        ("Price at Team list", 1995, f"={ref('completions_per_customer')}", f"={ref('support_hours')}", f"={ref('csm_annual_loaded')}"),
        ("Monthly card billing", f"={ref('hyp_mrr')}", f"={ref('completions_per_customer')}", f"={ref('support_hours')}", f"={ref('csm_annual_loaded')}"),
        ("Onboarding not in this margin (steady state)", f"={ref('hyp_mrr')}", f"={ref('completions_per_customer')}", f"={ref('support_hours')}", f"={ref('csm_annual_loaded')}"),
    ]
    for i, (label, mrr, comps, hours, csm) in enumerate(cases):
        r = 5 + i
        sens.cell(r, 1, label)
        sens.cell(r, 2, mrr).number_format = '"$"#,##0'
        sens.cell(r, 3, comps).number_format = "#,##0"
        sens.cell(r, 4, hours).number_format = "0.0"
        sens.cell(r, 5, csm).number_format = '"$"#,##0'
        # AI cost depends on case
        if label.startswith("Wrong model"):
            ai = (
                f"C{r}*({ref('stress_input_tokens')}/1000000*{ref('stress_price_in')}+"
                f"{ref('stress_output_tokens')}/1000000*{ref('stress_price_out')})*{ref('fx_aud_per_usd')}"
            )
        else:
            ai = (
                f"C{r}*({ref('input_tokens')}/1000000*{ref('price_in_usd_per_m')}+"
                f"{ref('output_tokens')}/1000000*{ref('price_out_usd_per_m')})*{ref('fx_aud_per_usd')}"
            )
        card = f"B{r}*{ref('card_rate')}+{ref('card_fixed_aud')}" if label.startswith("Monthly card") else "0"
        # margin = (mrr - infra/25 - ai - card - support - csm/25) / mrr
        sens.cell(
            r,
            6,
            f"=IF(B{r}=0,NA(),(B{r}-(({infra_usd('25')}*{ref('fx_aud_per_usd')})/25)-({ai})-({card})-(D{r}*{ref('support_rate')})-(ROUNDUP(25/{ref('customers_per_csm')},0)*E{r}/12/25))/B{r})",
        ).number_format = "0.0%"
        for c in range(1, 7):
            sens.cell(r, c).border = THIN
            sens.cell(r, c).alignment = WRAP
    sens.column_dimensions["A"].width = 62
    for col_i in range(2, 7):
        sens.column_dimensions[get_column_letter(col_i)].width = 28
    sens.row_dimensions[4].height = 30

    # CAC sensitivity
    sens["A18"] = "Payback if win rate and churn move"
    sens["A18"].font = SECTION_FONT
    for i, h in enumerate(["Case", "Opportunities per win", "Annual churn", "Cash payback (months)", "Fully loaded payback (months)", "LTV : fully loaded CAC"], 1):
        sens.cell(19, i, h)
    style_header(sens, 19, 6)
    pay_cases = [
        ("Base 20% win, 10% churn", f"={ref('opps_per_win')}", f"={ref('churn_base')}"),
        ("10% win, 10% churn", 10, f"={ref('churn_base')}"),
        ("20% win, 25% churn", f"={ref('opps_per_win')}", 0.25),
        ("10% win, 25% churn", 10, 0.25),
        ("10% win, 40% churn", 10, 0.40),
    ]
    for i, (label, opps, churn) in enumerate(pay_cases):
        r = 20 + i
        sens.cell(r, 1, label)
        sens.cell(r, 2, opps)
        sens.cell(r, 3, churn).number_format = "0%"
        # cash payback uses N=25 gp from unit sheet
        sens.cell(r, 4, f"=IF((UnitEconomics!B5-UnitEconomics!B27)<=0,NA(),{ref('cash_cac')}/(UnitEconomics!B5-UnitEconomics!B27))").number_format = "0.0"
        sens.cell(
            r,
            5,
            f"=IF((UnitEconomics!B5-UnitEconomics!B27)<=0,NA(),(B{r}*{ref('hours_per_opp')}*{ref('founder_opp_per_hour')}+{ref('cash_cac')})/(UnitEconomics!B5-UnitEconomics!B27))",
        ).number_format = "0.0"
        sens.cell(
            r,
            6,
            f"=IF((B{r}*{ref('hours_per_opp')}*{ref('founder_opp_per_hour')}+{ref('cash_cac')})=0,NA(),"
            f"((UnitEconomics!B5-UnitEconomics!B27)/(1-(1-C{r})^(1/12)))/(B{r}*{ref('hours_per_opp')}*{ref('founder_opp_per_hour')}+{ref('cash_cac')}))",
        ).number_format = "0.0"
        for c in range(1, 7):
            sens.cell(r, c).border = THIN

    sens["A27"] = (
        "Cash payback does not change with win rate because lost pursuits are not in cash CAC. "
        "They are in fully loaded payback, which multiplies founder hours. "
        "That is why a founder-led motion can look 'cheap' in cash and still consume the company."
    )
    sens["A27"].alignment = WRAP
    sens.merge_cells("A27:F29")

    # ----- Sources -----
    src = wb.create_sheet("Sources")
    src["A1"] = "External sources read on 1 November 2026"
    src["A1"].font = SECTION_FONT
    src["A3"] = "Item"
    src["B3"] = "Figure used"
    src["C3"] = "Source"
    style_header(src, 3, 3)
    source_rows = [
        ("AUDUSD", "0.7040 USD per AUD on 30 Oct 2026", "https://www.rba.gov.au/statistics/frequency/exchange-rates.html"),
        ("gpt-4o-mini input / output", "USD 0.15 / 0.60 per 1M tokens", "https://developers.openai.com/api/docs/pricing"),
        ("gpt-4o-mini status", "Deprecated. API removal 14 Jan 2027. Cited replacement gpt-6-luna.", "https://developers.openai.com/api/docs/deprecations"),
        ("gpt-6-luna short context", "USD 0.10 input / 0.50 output per 1M, as listed on the pricing page", "https://developers.openai.com/api/docs/pricing"),
        ("gpt-4o standard, stress only", "USD 2.50 / 10 per 1M", "https://developers.openai.com/api/docs/pricing"),
        ("Vercel Pro", "USD 20 / month platform fee, USD 20 usage credit", "https://vercel.com/docs/plans/pro-plan"),
        ("Vercel Sydney active CPU", "USD 0.180 / hour; provisioned memory USD 0.0149 / GB-hour. Not modelled as a per-customer line because there is no production trace.", "https://vercel.com/docs/functions/usage-and-pricing"),
        ("Supabase Pro and compute", "Pro USD 25; Micro 10; Small 15; Medium 60; Large 110; credit USD 10", "https://supabase.com/pricing"),
        ("Stripe Australia domestic online", "1.65% + A$0.30, GST included", "https://stripe.com/au/pricing"),
        ("Repository AI path", "Default model gpt-4o-mini. Anthropic and Azure providers throw not-implemented. No embeddings client.", "src/lib/ai/models.ts, src/lib/ai/provider.ts"),
        ("Repository forecast path", "Deterministic evidence from uploaded records. No model call in manufacturing-analysis.ts.", "src/executive-snapshot-studio/intelligence/manufacturing-analysis.ts"),
        ("Not in the cost model", "Datadog, Sentry, status page, SOC 2 auditor, pen-test, cyber insurance, PITR beyond 7-day backups, residency premium. Unknown until purchased.", "No invoice in the repository"),
    ]
    for i, (a, b, c) in enumerate(source_rows):
        src.cell(5 + i, 1, a)
        src.cell(5 + i, 2, b).alignment = WRAP
        src.cell(5 + i, 3, c).alignment = WRAP
        src.row_dimensions[5 + i].height = 32
    autosize(src, {1: 42, 2: 88, 3: 78})

    add_managed_services(wb)
    add_offer_architecture(wb)
    add_reconciliation(wb)

    # ----- Cover -----
    cover = wb.create_sheet("Cover", 0)
    cover["A1"] = "ExecutiveOS industrial unit economics and managed intelligence"
    cover["A1"].font = Font(name="Calibri", size=18, bold=True, color=NAVY)
    cover["A3"] = "Status"
    cover["B3"] = "Recommendation model. Not an approved price, forecast, or headcount plan."
    cover["A4"] = "Date"
    cover["B4"] = "1 November 2026 model. Reconciled 2 November 2026 (Australia/Brisbane). Prices still unapproved."
    cover["A5"] = "Currency"
    cover["B5"] = "AUD outputs. USD vendor prices converted at Assumptions!fx_aud_per_usd."
    cover["A6"] = "Edit"
    cover["B6"] = "Yellow cells on Assumptions and ServiceAssumptions, and the yellow new-logo columns on Forecast36."
    cover["A7"] = "Do not edit"
    cover["B7"] = "Formula cells. Platform sheets are unchanged by the managed-intelligence sheets, which only read them."
    cover["A9"] = "Sheets"
    sheets = [
        ("Assumptions", "Every input and every cited vendor price."),
        ("UnitEconomics", "One customer at six prices. Cash margin and fully loaded margin. Block A is founder-delivered. Block B is N=25 with a CSM."),
        ("Scale", "1, 5, 10, 25, 50, 100 customers at the hypothesis price."),
        ("Acquisition", "CAC, payback, LTV arithmetic. The ratio is not evidence."),
        ("Forecast36", "Conservative, base, and aggressive logo paths for 36 months."),
        ("Sensitivity", "AI volume, wrong model, support hours, CSM cost, price, card fees, win rate, churn."),
        ("Sources", "URLs and repository paths, including super and Queensland payroll tax."),
        ("ServiceAssumptions", "Managed-intelligence inputs. Green cells are formulas."),
        ("ServicePackages", "Essential, Advanced, Strategic. Specialist, founder, and contractor margins."),
        ("ServiceScale", "1, 5, 10, 25, 50 customers. Forced hire versus the staffing policy."),
        ("MarginMix", "SaaS margin, service margin, and combined margin. Double-count shown on its own row."),
        ("ServiceForecast36", "36 months of service attach, capacity, and company cash profit on top of Forecast36."),
        ("ServiceSensitivity", "Labour, hours, utilization, discussed prices, and combined-margin breaks."),
        ("OfferArchitecture", "One order with separate lines. Floor requires material governance. Essential is the founder-led default."),
        ("PlatformCost", "Variable and fully loaded platform cost. The partial figure near $96 is not the commercial margin."),
        ("CustomerMargins", "Combined margin by package, founder-led and specialist-led, with the 2 November partial-cost column kept."),
        ("PilotEconomics", "Paid and design-partner pilots, converted and not converted. Credit touches the first entity only."),
        ("RevenueReporting", "List value, net contracted ARR, invoiced revenue, cash, pilot, activation, expansion."),
        ("CapacityTransition", "Ready hours hire. Pipeline does not. Founder time stays costed after a specialist is hired."),
        ("DecisionRegister", "Direction adopted for this draft, proposed terms, unresolved items, assumptions to validate."),
    ]
    cover["A10"] = "Sheet"
    cover["B10"] = "What it answers"
    style_header(cover, 10, 2)
    for i, (name, desc) in enumerate(sheets):
        cover.cell(11 + i, 1, name)
        cover.cell(11 + i, 2, desc).alignment = WRAP
        cover.row_dimensions[11 + i].height = 28
    cover["A32"] = (
        "Platform gross margin is delivery margin: infrastructure, model inference, card fees, paid support, and the human who actually delivers the platform. "
        "A margin that uses only the partial allocation near $96 a month is not the validated commercial margin. "
        "Managed intelligence is a separate revenue line. Founder time stays costed after a specialist is hired. "
        "Forecast36 and ServiceForecast36 are unchanged. Sales, engineering, and G&A stay overhead."
    )
    cover["A32"].alignment = WRAP
    cover.merge_cells("A32:B34")
    autosize(cover, {1: 28, 2: 120})
    cover.row_dimensions[26].height = 36
    cover.sheet_properties.tabColor = NAVY

    # Print settings
    for ws in wb.worksheets:
        ws.page_setup.orientation = "landscape"
        ws.page_setup.fitToPage = True
        ws.page_setup.fitToWidth = 1
        ws.page_setup.fitToHeight = 0
        ws.page_setup.paperSize = ws.PAPERSIZE_A4
        ws.sheet_view.showGridLines = False
        ws.oddHeader.left.text = "ExecutiveOS  |  Industrial unit economics  |  Not an approved decision"
        ws.oddFooter.left.text = "Braltiq  |  Confidential working model"
        ws.oddFooter.right.text = "Page &P of &N"
        ws.sheet_view.zoomScale = 110

    assumptions.sheet_properties.tabColor = "F4B183"
    unit.sheet_properties.tabColor = "548235"
    scale.sheet_properties.tabColor = "548235"
    fc.sheet_properties.tabColor = "C65911"
    sens.sheet_properties.tabColor = "C65911"

    wb.save(OUT)
    return {"path": str(OUT), "cons_logos": sum(CONS_NEW), "base_logos": sum(BASE_NEW), "agg_logos": sum(AGG_NEW)}


if __name__ == "__main__":
    print(build())
