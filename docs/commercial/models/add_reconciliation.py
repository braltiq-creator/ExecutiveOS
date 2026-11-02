"""Reconciliation sheets for the 2 November 2026 commercial review.

Does not rewrite Assumptions values, Forecast36, ServiceForecast36, Scale, or MarginMix.
New names read those sheets. Historical scenario logic stays where it was.
"""

from __future__ import annotations

from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.worksheet import Worksheet

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
AUD = '"$"#,##0.00'
AUD0 = '"$"#,##0'
PCT = "0.0%"


def _header(ws: Worksheet, row: int, headers: list[str]) -> None:
    for i, h in enumerate(headers, 1):
        cell = ws.cell(row, i, h)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = WRAP
    ws.row_dimensions[row].height = 32


def _name(wb, name: str, ref: str) -> None:
    wb.defined_names.add(DefinedName(name, attr_text=ref))


def _paint(ws: Worksheet, row: int, cols: int) -> None:
    for c in range(1, cols + 1):
        ws.cell(row, c).border = THIN
        ws.cell(row, c).alignment = WRAP
    ws.row_dimensions[row].height = 30


def add_reconciliation(wb) -> None:
    _platform_cost(wb)
    _customer_margins(wb)
    _pilot(wb)
    _revenue(wb)
    _capacity(wb)
    _register(wb)


def _platform_cost(wb) -> None:
    ws = wb.create_sheet("PlatformCost")
    ws["A1"] = "Platform direct cost — variable, partial, and fully loaded"
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:E1")
    ws["A2"] = (
        "Reconciled 2 November 2026. The figure near $96 is MarginMix reclassified SaaS COGS at 25 logos: "
        "shared infrastructure allocated across 25, the unmetered small-model hypothesis, and one paid support hour. "
        "Customer success is removed from that figure on purpose. Founder platform hours are not in it. "
        "A margin calculated from it is not the validated commercial margin. "
        "Storage, data processing, and monitoring are not separate meters. Monitoring software is not contracted. "
        "Prices remain exclusive of GST."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:E4")

    _header(ws, 5, ["Item", "Monthly AUD", "Basis", "Inside the partial figure?", "Quoted as the commercial margin?"])

    infra_one = (
        "(vercel_pro_usd+supabase_pro_usd+supabase_micro_usd-supabase_credit_usd)*fx_aud_per_usd"
    )
    infra_n25 = (
        "(vercel_pro_usd+supabase_pro_usd+supabase_medium_usd-supabase_credit_usd)*fx_aud_per_usd"
    )
    ai = (
        "completions_per_customer*(input_tokens/1000000*price_in_usd_per_m"
        "+output_tokens/1000000*price_out_usd_per_m)*fx_aud_per_usd"
    )

    lines = [
        (6, "plat_ai_entity", f"={ai}", "Model usage, one entity, base hypothesis. Tokens are not metered.", "Yes", "No. Too small to be the margin, and unmeasured."),
        (7, "plat_card_entity", "=list_mrr*card_share*card_rate+card_share*card_fixed_aud", "Stripe on one list-price entity. Default card share is zero because the motion is an annual invoice.", "Yes, and it is zero at the default", "No"),
        (8, "plat_infra_incremental", 0, "Cash infrastructure added by one more entity while the compute step stays put. The step costs are shared.", "No", "No"),
        (9, "plat_variable_entity", "=plat_ai_entity+plat_card_entity+plat_infra_incremental", "Variable platform cost per operating entity.", "Partly", "No. This is the variable slice, not a full margin."),
        (11, "plat_infra_one", f"={infra_one}", "Whole current stack on one customer. Vercel Pro, Supabase Pro, Micro, less the compute credit.", "Only the 25-logo slice of a larger step", "Yes, inside the founder-led loaded cost"),
        (12, "plat_infra_n25_total", f"={infra_n25}", "Stack at the 25-customer hypothesis, which steps to Medium compute.", "The total, before dividing", "No"),
        (13, "plat_infra_per_n25", "=plat_infra_n25_total/25", "Shared infrastructure allocation per entity at 25 logos.", "Yes", "Yes, inside the scaled loaded cost"),
        (14, "plat_support_hour", "=support_hours*support_rate", "One support hour per account, priced at the paid-role rate. Cash is zero while the founder absorbs the hour.", "Yes", "Not on top of founder platform hours. That would count the hour twice."),
        (15, "plat_founder_platform", "=founder_steady_hours*founder_opp_per_hour", "Four founder hours a month on the account before a CSM exists. The support hour sits inside these four.", "No", "Yes, in the founder-led loaded cost"),
        (16, "plat_csm_n25", "=ROUNDUP(25/customers_per_csm,0)*csm_annual_loaded/12/25", "Allocated platform customer success at 25 logos. The ratio rounds up, so 25 logos carry two salaries.", "No. Removed to produce the partial figure.", "Yes, when a CSM is actually employed and the account is not also on Managed Intelligence"),
        (17, "plat_partial_n25", "=MarginMix!B14", "The partial figure the 2 November draft used as platform direct cost.", "This is that figure", "No"),
        (18, "plat_partial_rebuild", "=plat_infra_per_n25+plat_ai_entity+plat_card_entity+plat_support_hour", "Same partial figure rebuilt from the lines above. The gap row should be about zero.", "Yes", "No"),
        (19, "plat_partial_gap", "=plat_partial_n25-plat_partial_rebuild", "Tie-out to MarginMix. A gap means the partial figure contains something this sheet has not named.", "Check", "No"),
        (21, "plat_loaded_founder", "=plat_infra_one+plat_ai_entity+plat_card_entity+plat_founder_platform", "Fully loaded platform cost for one founder-led entity. Support dollars are not added again.", "No", "Yes. This is the early-customer platform cost."),
        (22, "plat_loaded_csm", "=plat_infra_per_n25+plat_ai_entity+plat_card_entity+plat_support_hour+plat_csm_n25", "Fully loaded platform cost per entity at 25 logos with the awkward CSM allocation. Founder platform hours are zero because the CSM has replaced them.", "The vendor and support lines only", "Yes, for a platform-only book at that scale"),
        (23, "plat_service_led", "=plat_infra_per_n25+plat_ai_entity+plat_card_entity+plat_support_hour", "Platform cost once founder platform hours have stopped and no CSM is also paid. The service specialist is not in this row.", "Yes. This is the partial figure.", "Only with that staffing condition stated beside it"),
        (24, "plat_csm_full_ratio", "=csm_annual_loaded/12/customers_per_csm", "CSM cost at a full 15-account load, for comparison with the awkward 25-logo case.", "No", "Comparison"),
        (25, "plat_loaded_full_ratio", "=plat_infra_per_n25+plat_ai_entity+plat_card_entity+plat_support_hour+plat_csm_full_ratio", "Fully loaded per entity if each CSM carries a full 15 accounts.", "The vendor and support lines only", "Yes, as the cleaner scale case"),
        (27, "plat_storage_separate", 0, "No separate storage meter. Treated as inside the Supabase compute step until a bill says otherwise.", "Not separately", "Excluded until measured. Not assumed to be material."),
        (28, "plat_processing_separate", 0, "Manufacturing forecast analysis in the product makes no model call. No ETL vendor is contracted.", "Inside model usage where a call exists", "Excluded until measured"),
        (29, "plat_monitoring", 0, "No Datadog, Sentry, or status-page contract is in the repository.", "No", "Excluded. A purchased tool is a new direct cost."),
        (30, "plat_other_third_party", 0, "No other contracted platform vendor. Stripe is the card row.", "No", "Excluded until a contract exists"),
    ]
    for row, name, value, basis, inside, quoted in lines:
        ws.cell(row, 1, name)
        cell = ws.cell(row, 2, value)
        cell.number_format = AUD
        cell.border = THIN
        ws.cell(row, 3, basis).alignment = WRAP
        ws.cell(row, 4, inside).alignment = WRAP
        ws.cell(row, 5, quoted).alignment = WRAP
        _paint(ws, row, 5)
        _name(wb, name, f"PlatformCost!$B${row}")

    ws["A32"] = "Margins on one initial entity. Activation is not in these monthly figures."
    ws["A32"].font = SECTION_FONT
    margins = [
        (33, "List margin on the partial figure — not validated", "=(list_mrr-plat_partial_n25)/list_mrr", "Do not quote this as the platform margin."),
        (34, "List margin, founder-led fully loaded", "=(list_mrr-plat_loaded_founder)/list_mrr", "Early customer. One stack, four founder hours, no second support charge."),
        (35, "Collected margin, founder-led fully loaded", "=(hyp_mrr-plat_loaded_founder)/hyp_mrr", "Uses the 11-month collected rate."),
        (36, "List margin, CSM at 25 logos", "=(list_mrr-plat_loaded_csm)/list_mrr", "Awkward ratio: two CSM salaries across 25 logos."),
        (37, "Collected margin, CSM at 25 logos", "=(hyp_mrr-plat_loaded_csm)/hyp_mrr", "The scale case that has to clear 80–85%."),
        (38, "List margin, CSM at a full 15-account load", "=(list_mrr-plat_loaded_full_ratio)/list_mrr", "Cleaner than the 25-logo rounding."),
        (39, "List margin, service-led partial platform cost", "=(list_mrr-plat_service_led)/list_mrr", "Valid only when founder platform delivery has stopped and a CSM is not also paid."),
        (40, "Year-1 founder-led platform margin, activation once", f"=(list_mrr*annual_months_paid-(plat_loaded_founder*12+onboarding_hours*founder_opp_per_hour))/(list_mrr*annual_months_paid)", "Activation is in this row once. It is not also in plat_loaded_founder."),
    ]
    for row, label, formula, note in margins:
        ws.cell(row, 1, label).alignment = WRAP
        cell = ws.cell(row, 2, formula)
        cell.number_format = PCT
        cell.border = THIN
        ws.cell(row, 3, note).alignment = WRAP
        _paint(ws, row, 3)

    ws["A42"] = (
        "Per operating entity, the variable cost is the model row plus card fees plus zero incremental infrastructure. "
        "Per account, founder time and the support hour are shared across the entities on that order. A second entity adds another model allowance and does not add another four founder hours or another support hour. "
        "A second Supabase project, if engineering requires one, is not in this cost. That isolation is unconfirmed."
    )
    ws["A42"].alignment = WRAP
    ws.merge_cells("A42:E44")
    ws.column_dimensions["A"].width = 62
    ws.column_dimensions["B"].width = 22
    ws.column_dimensions["C"].width = 78
    ws.column_dimensions["D"].width = 42
    ws.column_dimensions["E"].width = 55
    ws.sheet_properties.tabColor = "548235"
    ws.freeze_panes = "A6"
    ws.sheet_view.showGridLines = False


def _customer_margins(wb) -> None:
    ws = wb.create_sheet("CustomerMargins")
    ws["A1"] = "Combined customer margin by package and by who delivers"
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:L1")
    ws["A2"] = (
        "One initial entity, standard terms, no floor, no pilot. Prices exclusive of GST. "
        "Founder-led means the founder carries the four platform hours and the service hours. "
        "Specialist-led means a full book, founder platform hours have stopped, and no CSM is also charged. "
        "The last margin column is the 2 November method: partial platform cost times entities, founder service hours, activation once. It is kept so that result is not overwritten. "
        "Essential is the package the founder-led model offers. Advanced is the package to prefer once specialist capacity is funded. Strategic is reserved."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:L4")
    headers = [
        "Package",
        "Commercial role",
        "Service monthly",
        "Hours",
        "Year-1 contracted revenue",
        "Founder monthly cost",
        "Founder monthly GM, list",
        "Founder year-1 GM",
        "Specialist monthly cost",
        "Specialist monthly GM, list",
        "Specialist year-1 GM",
        "2 Nov partial founder year-1 GM",
    ]
    _header(ws, 5, headers)
    packages = [
        (6, "Platform only", "No service line", 0, 0),
        (7, "Essential", "Default while the founder delivers", "=svc_essential_price", "=svc_essential_hours"),
        (8, "Advanced", "Preferred once a specialist is funded and available", "=svc_advanced_price", "=svc_advanced_hours"),
        (9, "Strategic", "Reserved for a genuine extra requirement and real capacity", "=svc_strategic_price", "=svc_strategic_hours"),
    ]
    for row, label, role, price, hours in packages:
        ws.cell(row, 1, label)
        ws.cell(row, 2, role)
        ws.cell(row, 3, price).number_format = AUD0
        ws.cell(row, 4, hours).number_format = "0"
        ws.cell(row, 5, f"=list_mrr*annual_months_paid+C{row}*12").number_format = AUD0
        ws.cell(row, 6, f"=plat_loaded_founder+D{row}*founder_opp_per_hour+IF(D{row}=0,0,svc_ai_per_customer)").number_format = AUD
        ws.cell(row, 7, f"=IF(list_mrr+C{row}=0,NA(),(list_mrr+C{row}-F{row})/(list_mrr+C{row}))").number_format = PCT
        ws.cell(
            row,
            8,
            f"=IF(E{row}=0,NA(),(E{row}-(plat_loaded_founder*12+onboarding_hours*founder_opp_per_hour+D{row}*founder_opp_per_hour*12+IF(D{row}=0,0,svc_ai_per_customer*12)))/E{row})",
        ).number_format = PCT
        ws.cell(row, 9, f"=plat_service_led+D{row}*svc_hour_cost+IF(D{row}=0,0,svc_ai_per_customer)").number_format = AUD
        ws.cell(row, 10, f"=IF(list_mrr+C{row}=0,NA(),(list_mrr+C{row}-I{row})/(list_mrr+C{row}))").number_format = PCT
        ws.cell(
            row,
            11,
            f"=IF(E{row}=0,NA(),(E{row}-(plat_service_led*12+onboarding_hours*founder_opp_per_hour+D{row}*svc_hour_cost*12+IF(D{row}=0,0,svc_ai_per_customer*12)))/E{row})",
        ).number_format = PCT
        ws.cell(
            row,
            12,
            f"=IF(E{row}=0,NA(),(E{row}-(MarginMix!B14*12+onboarding_hours*founder_opp_per_hour+D{row}*founder_opp_per_hour*12))/E{row})",
        ).number_format = PCT
        _paint(ws, row, 12)

    ws["A11"] = "Same packages if founder platform hours are still loaded after a specialist is delivering the service"
    ws["A11"].font = SECTION_FONT
    ws.merge_cells("A11:G11")
    _header(ws, 12, ["Package", "Monthly cost", "Monthly GM, list", "Year-1 GM", "Note", "", "", "", "", "", "", ""])
    for i, (src, label) in enumerate(((7, "Essential"), (8, "Advanced"), (9, "Strategic"))):
        row = 13 + i
        ws.cell(row, 1, label)
        ws.cell(row, 2, f"=plat_loaded_founder+D{src}*svc_hour_cost+IF(D{src}=0,0,svc_ai_per_customer)").number_format = AUD
        ws.cell(row, 3, f"=IF(list_mrr+C{src}=0,NA(),(list_mrr+C{src}-B{row})/(list_mrr+C{src}))").number_format = PCT
        ws.cell(
            row,
            4,
            f"=IF(E{src}=0,NA(),(E{src}-(plat_loaded_founder*12+onboarding_hours*founder_opp_per_hour+D{src}*svc_hour_cost*12+IF(D{src}=0,0,svc_ai_per_customer*12)))/E{src})",
        ).number_format = PCT
        ws.cell(row, 5, "Founder platform time is not treated as free. The specialist still carries the service hours.")
        _paint(ws, row, 5)

    ws["A17"] = (
        "Monthly gross margin excludes activation. Year-1 gross margin includes the 12 activation hours once. "
        "SaaS margin and service margin are not blended inside one product. The combined figure is the customer, reported beside the platform figure on PlatformCost. "
        "A CSM kept on the platform as well as a specialist on the service is the double count MarginMix already shows. This sheet does not repeat it as a recommended case."
    )
    ws["A17"].alignment = WRAP
    ws.merge_cells("A17:L19")
    widths = [28, 62, 18, 12, 26, 22, 24, 20, 24, 26, 22, 32]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A6"
    ws.sheet_properties.tabColor = "548235"
    ws.sheet_view.showGridLines = False


def _pilot(wb) -> None:
    ws = wb.create_sheet("PilotEconomics")
    ws["A1"] = "Pilot economics — converted and not converted"
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:L1")
    ws["A2"] = (
        "30 days. One manufacturing forecasting use case. 15 founder hours. "
        "The first three approved design partners are at a zero fee. Every later pilot is the paid fee. "
        "The paid fee is credited in full against the first-year initial-entity platform invoice, and only when the customer signs within 30 days of the review. "
        "The credit does not touch Managed Intelligence, activation, or an additional entity. "
        "A credit reduces year-1 invoiced platform revenue. It does not reduce net contracted ARR, and it does not survive renewal. "
        "Fully loaded pilot cost is founder time plus one month of the single-customer stack plus one month of the base model hypothesis. "
        "The cash margin on a paid pilot looks extreme because founder time is not cash. Quote the fully loaded margin. "
        "Prices exclusive of GST."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:L5")

    ws["A6"] = "pilot_loaded_cost"
    ws["B6"] = "=arch_pilot_hours*founder_opp_per_hour+plat_infra_one+plat_ai_entity"
    ws["B6"].number_format = AUD
    ws["C6"] = "Founder hours at the opportunity rate, plus one month of the current stack, plus base model usage."
    _name(wb, "pilot_loaded_cost", "PilotEconomics!$B$6")
    ws["A7"] = "pilot_cash_cost"
    ws["B7"] = "=plat_infra_one+plat_ai_entity"
    ws["B7"].number_format = AUD
    ws["C7"] = "Direct cash. Founder time excluded. Not the commercial margin."
    _name(wb, "pilot_cash_cost", "PilotEconomics!$B$7")
    _paint(ws, 6, 3)
    _paint(ws, 7, 3)

    headers = [
        "Case",
        "Converts",
        "Entities",
        "Service code",
        "Pilot fee",
        "Credit to initial entity",
        "Year-1 platform invoice",
        "MI ARR",
        "Expansion ARR not credited",
        "Net contracted ARR",
        "Year-1 cash collected",
        "Year-1 loaded cost",
        "Year-1 loaded margin",
        "Pilot-only loaded margin",
    ]
    _header(ws, 9, headers)
    # code: 0 platform only, 1 essential. Fee is 0 or arch_pilot_fee.
    cases = [
        (10, "Design partner, does not convert", 0, 1, 0, 0),
        (11, "Design partner, converts, platform only", 1, 1, 0, 0),
        (12, "Paid pilot, does not convert", 0, 1, 0, "=arch_pilot_fee"),
        (13, "Paid pilot, converts, platform only", 1, 1, 0, "=arch_pilot_fee"),
        (14, "Paid pilot, converts, Essential", 1, 1, 1, "=arch_pilot_fee"),
        (15, "Paid pilot, converts, two entities + Essential", 1, 2, 1, "=arch_pilot_fee"),
    ]
    for row, label, converts, entities, service, fee in cases:
        ws.cell(row, 1, label)
        ws.cell(row, 2, converts)
        ws.cell(row, 3, entities)
        ws.cell(row, 4, service)
        ws.cell(row, 5, fee).number_format = AUD0
        # Credit only on conversion of a paid pilot, capped at the initial entity's contracted platform amount.
        ws.cell(row, 6, f'=IF(AND(B{row}=1,E{row}>0),MIN(E{row},list_mrr*annual_months_paid),0)').number_format = AUD0
        contracted = f"IF(B{row}=1,IF(AND(C{row}>=2,0=1),arch_floor,list_mrr+MAX(0,C{row}-1)*second_entity_mrr)*annual_months_paid,0)"
        # These cases are standard terms. No floor. Contracted platform is the rate card x 11 when they convert.
        ws.cell(
            row,
            7,
            f"=IF(B{row}=1,(list_mrr+MAX(0,C{row}-1)*second_entity_mrr)*annual_months_paid-F{row},0)",
        ).number_format = AUD0
        ws.cell(
            row,
            8,
            f"=IF(AND(B{row}=1,D{row}=1),svc_essential_price*12,0)",
        ).number_format = AUD0
        ws.cell(
            row,
            9,
            f"=IF(B{row}=1,MAX(0,C{row}-1)*second_entity_mrr*annual_months_paid,0)",
        ).number_format = AUD0
        ws.cell(
            row,
            10,
            f"=IF(B{row}=1,(list_mrr+MAX(0,C{row}-1)*second_entity_mrr)*annual_months_paid+H{row},0)",
        ).number_format = AUD0
        # Cash: platform invoice after credit + MI + pilot fee actually invoiced. Activation fee is zero.
        ws.cell(row, 11, f"=G{row}+H{row}+E{row}").number_format = AUD0
        # Cost: pilot always. Subscription costs only on conversion. Activation once on conversion.
        hours = f"IF(AND(B{row}=1,D{row}=1),svc_essential_hours,0)"
        ws.cell(
            row,
            12,
            f"=pilot_loaded_cost+IF(B{row}=1,(plat_infra_one+plat_ai_entity*C{row}+plat_founder_platform)*12+onboarding_hours*founder_opp_per_hour+({hours})*founder_opp_per_hour*12,0)",
        ).number_format = AUD0
        ws.cell(row, 13, f"=IF(K{row}=0,NA(),(K{row}-L{row})/K{row})").number_format = PCT
        ws.cell(row, 14, f"=IF(E{row}=0,NA(),(E{row}-pilot_loaded_cost)/E{row})").number_format = PCT
        _paint(ws, row, 14)

    ws["A17"] = "What changes when the pilot converts"
    ws["A17"].font = SECTION_FONT
    ws["A18"] = (
        "On conversion the paid fee is not extra profit. Cash in on the pilot is offset by the platform credit, so year-1 platform-related cash equals the contracted platform amount. "
        "The extra economic cost of having run a pilot, versus starting on the subscription directly, is the fully loaded pilot delivery cost. "
        "A design partner who converts has that same extra cost and no fee to credit. "
        "A paid pilot that does not convert keeps the fee, recognises no ARR, and still carries the delivery cost. "
        "A design partner that does not convert recognises no revenue and carries the delivery cost. "
        "Pilot revenue is never added to ARR. The fee is not refunded in this draft when the pilot stops; counsel writes the clause. "
        "Activation is added once on conversion and is not inside pilot_loaded_cost. The two caps are different work. If a real pilot has already done the activation, set the activation hours to zero on that order rather than adding both."
    )
    ws["A18"].alignment = WRAP
    ws.merge_cells("A18:N21")
    ws.column_dimensions["A"].width = 56
    for col in range(2, 15):
        ws.column_dimensions[get_column_letter(col)].width = 22
    ws.column_dimensions["C"].width = 14
    ws.freeze_panes = "B10"
    ws.sheet_properties.tabColor = "1F4E79"
    ws.sheet_view.showGridLines = False
    # silence unused local
    del contracted


def _revenue(wb) -> None:
    ws = wb.create_sheet("RevenueReporting")
    ws["A1"] = "Revenue reporting — do not book list value as ARR"
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:D1")
    ws["A2"] = (
        "Exclusive of GST. GST is added where applicable. "
        "For one initial entity the list value is the monthly rate times 12. "
        "The net contracted platform amount is the monthly rate times 11, because one month of the platform is conceded on an annual invoice. "
        "Managed Intelligence is contracted at 12 months paid. "
        "Total net contracted ARR is those two amounts. It excludes pilot fees and activation. "
        "A pilot credit changes year-1 invoiced platform revenue and does not change ARR. "
        "The live order on OfferArchitecture is repeated here so the definitions stay attached to a real configuration."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:D5")

    _header(ws, 7, ["Measure", "Reference: one entity, no service, no pilot", "Live order", "Definition"])
    # Reference column is hardcoded structure via formulas, not the yellow order.
    rows = [
        (8, "Platform list value", "=list_mrr*12", "=OfferArchitecture!B20", "Rate card times 12. Not booked ARR."),
        (9, "Net contracted platform ARR", "=list_mrr*annual_months_paid", "=OfferArchitecture!B23", "Invoiced platform monthly times 11, after the floor if it binds. This is platform ARR."),
        (10, "Initial entity inside that ARR", "=list_mrr*annual_months_paid", "=OfferArchitecture!B24", "The first entity only."),
        (11, "Expansion ARR", 0, "=OfferArchitecture!B25", "Additional entities times their rate times 11. Already inside net contracted platform ARR. Shown so it is not lost."),
        (12, "Floor premium, annual", 0, "=OfferArchitecture!B26", "Platform revenue. Not a service."),
        (13, "Managed Intelligence ARR", 0, "=OfferArchitecture!B29", "Service monthly times 12. No free month."),
        (14, "Total net contracted ARR", "=B9+B13", "=OfferArchitecture!B30", "Platform plus Managed Intelligence. Pilot and activation are outside it."),
        (15, "Pilot fee invoiced", 0, "=OfferArchitecture!B32", "Own line. Not ARR."),
        (16, "Pilot credit", 0, "=OfferArchitecture!B33", "Reduces the year-1 initial-entity platform invoice only."),
        (17, "Activation fee", 0, "=OfferArchitecture!B31", "Standard order is zero. The internal cost is the next row."),
        (18, "Activation cost", "=onboarding_hours*founder_opp_per_hour", "=OfferArchitecture!B38", "Internal direct cost. Not revenue. Counted once."),
        (19, "Annual invoiced revenue, year 1", "=B9-B16+B13+B17+B15", "=OfferArchitecture!B35", "Platform after credit, plus service, activation fee, and any pilot fee."),
        (20, "Cash collected, year 1", "=B19", "=OfferArchitecture!B36", "Equals invoices while the industrial motion collects on invoice and card share stays at zero."),
    ]
    for row, label, ref, live, definition in rows:
        ws.cell(row, 1, label).alignment = WRAP
        ws.cell(row, 2, ref).number_format = AUD0
        ws.cell(row, 3, live).number_format = AUD0
        ws.cell(row, 4, definition).alignment = WRAP
        _paint(ws, row, 4)

    ws["A22"] = "One-entity platform, the pair that must not be collapsed"
    ws["A22"].font = SECTION_FONT
    ws["A23"] = "List value"
    ws["B23"] = "=list_mrr*12"
    ws["C23"] = "Not ARR"
    ws["A24"] = "Net contracted platform amount"
    ws["B24"] = "=list_mrr*annual_months_paid"
    ws["C24"] = "This is the ARR figure for that entity"
    for row in (23, 24):
        ws.cell(row, 2).number_format = AUD0
        _paint(ws, row, 3)

    ws["A26"] = (
        "Forecast36 was not rewritten. Its first-entity MRR uses the collected rate, so ending MRR times 12 equals net contracted platform ARR for those logos. "
        "From month 13 it adds second-entity MRR at the full additional-entity rate, not at eleven twelfths. "
        "Annualising that expansion line overstates expansion ARR by one conceded month per additional entity. "
        "The order sheets use times 11 for every platform line, including expansion and a floor premium. "
        "ServiceForecast36 prices are a separate 4% working hypothesis from month 13. That step is unapproved and is not a platform renewal term."
    )
    ws["A26"].alignment = WRAP
    ws.merge_cells("A26:D29")
    ws.column_dimensions["A"].width = 48
    ws.column_dimensions["B"].width = 42
    ws.column_dimensions["C"].width = 28
    ws.column_dimensions["D"].width = 78
    ws.sheet_properties.tabColor = "1F4E79"
    ws.freeze_panes = "A8"
    ws.sheet_view.showGridLines = False


def _capacity(wb) -> None:
    ws = wb.create_sheet("CapacityTransition")
    ws["A1"] = "Hiring reads ready contracted hours. Founder time does not become free."
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:G1")
    ws["A2"] = (
        "The 78-hour threshold stays the working hire test. It was set so an Essential-priced book covers one specialist salary at about a 65% cash service margin. "
        "Pipeline and verbal hours do not count. "
        "ServiceForecast36 still drops founder delivery hours to zero in the month a specialist is hired. That historical sheet is unchanged. "
        "This sheet keeps a residual founder oversight cost, at the yellow assumption on ServiceAssumptions, so the transition is not modelled as free founder time. "
        "Founder salary in Forecast36 overhead is a different cost and is not added again here."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:G5")

    _header(ws, 7, ["Test", "Hours", "Decision", "Why"])
    tests = [
        (8, "Founder delivery capacity", "=svc_founder_bridge_hours", "Cap on founder service delivery before a specialist exists.", "This is capacity, not a hiring signal."),
        (9, "Ready contracted hours", "=svc_ready_hours", '=IF(svc_ready_hours>=svc_hire_at_hours,"Hire","Do not hire")', "Signed work ready to start. This is the only hire test."),
        (10, "Forecast pipeline", "=svc_pipeline_hours", "Do not hire", "Pipeline is not contracted."),
        (11, "Verbal commitments", "=svc_verbal_hours", "Do not hire", "A conversation is not capacity."),
        (12, "Pipeline plus verbal, even if large", "=svc_pipeline_hours+svc_verbal_hours", "Do not hire", "Shown so a large pipeline cannot be misread as the test."),
        (13, "Specialist delivery capacity, one person", "=svc_delivery_month", "Available only after the hire test has passed and the person is employed.", "Nominal hours times the utilisation assumption. Not a promise of the first month."),
    ]
    for row, label, hours, decision, why in tests:
        ws.cell(row, 1, label)
        ws.cell(row, 2, hours).number_format = "0.0"
        ws.cell(row, 3, decision)
        ws.cell(row, 4, why).alignment = WRAP
        _paint(ws, row, 4)

    ws["A15"] = "Worked books. These rows do not write back to ServiceForecast36."
    ws["A15"].font = SECTION_FONT
    _header(
        ws,
        16,
        [
            "Book",
            "Contracted hours",
            "Ready to start",
            "Pipeline",
            "Heads",
            "Founder hours still costed",
            "Service revenue",
            "Specialist cost",
            "Founder residual cost",
            "Loaded service GM",
            "Utilisation of the specialist",
        ],
    )
    # Heads formula mirrors the policy but reads the ready column of THIS row, not pipeline.
    books = [
        (17, "Four Essential, founder-led", 24, 24, 40, 0),
        (18, "Two Advanced, inside the founder cap", 24, 24, 20, 0),
        (19, "78 pipeline hours, nothing signed", 0, 0, 78, 0),
        (20, "78 hours still in contracting, not ready to start", 78, 0, 0, 0),
        (21, "13 Essential, ready to start", 78, 78, 30, 1),
        (22, "Hours that clear 65% after residual", None, None, 0, 1),
    ]
    for row, label, contracted, ready, pipeline, _heads in books:
        ws.cell(row, 1, label)
        if row == 22:
            # Revenue needed so (R - salary - residual) / R >= target, ignoring the tiny AI line.
            # Hours at the Essential price per hour.
            ws.cell(
                row,
                2,
                "=IF(svc_essential_price=0,NA(),((svc_month_cost+svc_founder_residual_hours*founder_opp_per_hour)/(1-svc_target_gm))/(svc_essential_price/svc_essential_hours))",
            ).number_format = "0.0"
            ws.cell(row, 3, "=B22")
        else:
            ws.cell(row, 2, contracted).number_format = "0.0"
            ws.cell(row, 3, ready).number_format = "0.0"
        ws.cell(row, 4, pipeline).number_format = "0.0"
        ws.cell(row, 5, f'=IF(C{row}<svc_hire_at_hours,0,1)').number_format = "0"
        ws.cell(row, 6, f"=IF(E{row}>=1,svc_founder_residual_hours,IF(C{row}>0,MIN(B{row},svc_founder_bridge_hours),0))").number_format = "0.0"
        ws.cell(row, 7, f"=IF(E{row}>=1,B{row},IF(C{row}>0,MIN(B{row},svc_founder_bridge_hours),0))*(svc_essential_price/svc_essential_hours)").number_format = AUD0
        ws.cell(row, 8, f"=IF(E{row}>=1,svc_month_cost,0)").number_format = AUD0
        ws.cell(row, 9, f"=F{row}*founder_opp_per_hour").number_format = AUD0
        ws.cell(row, 10, f"=IF(G{row}=0,NA(),(G{row}-H{row}-I{row})/G{row})").number_format = PCT
        ws.cell(row, 11, f"=IF(E{row}=0,NA(),B{row}/svc_delivery_month)").number_format = PCT
        _paint(ws, row, 11)

    ws["A24"] = (
        "A book that is still in contracting has hours in the contracted column and zero in ready-to-start, so the hire test stays at zero and no revenue is taken. "
        "The Essential price per hour is used so the residual test has one rate. Advanced and Strategic are not the founder-led default, so they are not the hire-threshold book. "
        "Actual utilisation is delivered hours over specialist capacity, after the person starts. It is not the 65% planning assumption, and it is not a reason to hire early. "
        "ServiceForecast36 loaded margin in a hire month excludes founder hours. Add the residual cost back before treating that margin as the operating result. "
        "At the default residual, the original 78-hour book falls below the 65% loaded service floor. The threshold is retained as the salary-coverage test. The thicker book on the last row is what clears 65% once residual oversight is costed."
    )
    ws["A24"].alignment = WRAP
    ws.merge_cells("A24:K27")
    widths = [48, 20, 18, 14, 12, 26, 18, 18, 22, 20, 28]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.sheet_properties.tabColor = "C65911"
    ws.freeze_panes = "A17"
    ws.sheet_view.showGridLines = False


def _register(wb) -> None:
    ws = wb.create_sheet("DecisionRegister")
    ws["A1"] = "Decision register — 2 November 2026 reconciliation"
    ws["A1"].font = SECTION_FONT
    ws.merge_cells("A1:C1")
    ws["A2"] = (
        "Nothing in this register is a price in force. "
        "Approved strategic direction means the founder review adopted the rule for this draft. "
        "Proposed commercial terms are the amounts used to test that rule. They are not approved prices. "
        "GST is extra where it applies."
    )
    ws["A2"].alignment = WRAP
    ws.merge_cells("A2:C3")
    _header(ws, 5, ["Class", "Item", "Position in this draft"])
    rows = [
        ("Approved strategic direction", "Separate commercial lines", "Platform, Managed Intelligence, pilot, activation, and expansion stay identifiable. A blended SKU is outside this draft."),
        ("Approved strategic direction", "Founder-led service offer", "Essential is the default Managed Intelligence offer while the founder delivers it."),
        ("Approved strategic direction", "Offer once a specialist is funded", "Advanced becomes the preferred enterprise offer only when specialist delivery capacity is funded and available. Strategic is reserved for a genuine extra requirement and sufficient capacity."),
        ("Approved strategic direction", "What is sold versus what can be staffed", "The preferred package and the package the current delivery model can sustain are different decisions and are labelled as such."),
        ("Approved strategic direction", "Single-entity platform price", "A standard single-entity customer stays on the initial platform rate. The floor does not lift that customer."),
        ("Approved strategic direction", "Routine security questionnaire", "A questionnaire, on its own, does not create a platform premium."),
        ("Approved strategic direction", "Material governance", "The floor can bind only when the order has two or more entities, the governance is material, and the rate card is below the floor."),
        ("Approved strategic direction", "Service and entities", "Managed Intelligence does not change the platform price. A further entity does not inherit service hours."),
        ("Approved strategic direction", "Activation", "Standard activation is a zero-price order line, capped at 12 hours, with no travel, no custom integration, no bespoke data remediation, and no consulting outside that cap."),
        ("Approved strategic direction", "Pilot shape", "30 days, one forecasting use case, 15 delivery hours. Three approved design partners at no fee. Later pilots are paid. The fee credits the first-year initial-entity platform invoice only, and only if the customer signs within 30 days of the review."),
        ("Approved strategic direction", "GST presentation", "Prices are exclusive of GST. GST is added where it applies."),
        ("Approved strategic direction", "Hiring signal", "Hire from ready contracted hours. Pipeline and verbal commitments do not trigger a hire."),
        ("Approved strategic direction", "Founder time after a hire", "Founder time is still costed. ServiceForecast36, which drops those hours to zero, is unchanged and is not the operating rule."),
        ("Approved strategic direction", "ARR definition", "Book net contracted platform ARR plus Managed Intelligence ARR. Do not book the 12-times list value. Do not put a pilot or activation into ARR."),
        ("Proposed commercial terms", "Initial entity", "AUD $9,500 a month. Not an approved price."),
        ("Proposed commercial terms", "Additional entity", "AUD $3,000 a month of platform software. Not an approved price."),
        ("Proposed commercial terms", "Concession", "12-month platform commitment, 11 months charged, including additional entities and a floor-adjusted rate. Managed Intelligence is 12 months paid."),
        ("Proposed commercial terms", "List value and contracted amount", "One entity lists at AUD $114,000 and contracts at AUD $104,500. The second figure is the ARR."),
        ("Proposed commercial terms", "Floor", "AUD $15,000 a month, on the trigger above. The two-entity material case invoices AUD $15,000 a month and AUD $165,000 for the year."),
        ("Proposed commercial terms", "Essential", "AUD $3,000 a month, 6 hours."),
        ("Proposed commercial terms", "Advanced", "AUD $6,500 a month, 12 hours."),
        ("Proposed commercial terms", "Strategic", "AUD $12,000 a month, 16 hours."),
        ("Proposed commercial terms", "Paid pilot", "AUD $15,000. Assumptions still holds an unused AUD $12,000 hypothesis. The order uses AUD $15,000."),
        ("Proposed commercial terms", "Activation cost", "AUD $3,000 internal, at AUD $250 an hour. Customer fee zero."),
        ("Proposed commercial terms", "Hire threshold", "78 ready hours a month. Working assumption, retained."),
        ("Unresolved", "GST registration and place of supply", "Not in the repository. Invoice treatment waits on finance."),
        ("Unresolved", "Renewal wording", "The 4% service step is an unapproved assumption. It needs contract wording and legal and accounting review. No platform uplift is in Forecast36."),
        ("Unresolved", "Pilot stop clause", "This draft keeps the paid fee if the pilot stops. Counsel writes the clause."),
        ("Unresolved", "Second tenant", "Do not sell a second entity until engineering confirms isolation. A second project is not in the cost."),
        ("Unresolved", "Entitlement enforcement", "8 users, 2,000 completions, and one support hour per account are the definition of the fee. Billing does not enforce them."),
        ("Unresolved", "Which document may be quoted", "Website prices, the USD seat grid, and the in-code catalogues still disagree with this rate card. None of them is retired by this draft."),
        ("Unresolved", "Founder residual hours", "Eight hours a month after a hire is a yellow assumption, not an observed result."),
        ("Assumption requiring validation", "Partial platform cost near $96", "Real at the stated allocation. Not a full direct cost. See PlatformCost."),
        ("Assumption requiring validation", "Model tokens and completions", "Unmetered. Forecasting analysis itself makes no model call."),
        ("Assumption requiring validation", "Infrastructure steps", "Customer counts that move Micro to Medium to Large are hypotheses. No production trace."),
        ("Assumption requiring validation", "Monitoring, storage, data processing", "No separate bill. Enter a cost when one exists rather than implying a 99% margin."),
        ("Assumption requiring validation", "Support hour inside founder hours", "The loaded founder cost does not add the $90 support rate on top of the four founder hours."),
        ("Assumption requiring validation", "78-hour book and residual oversight", "The salary test still holds near 65% before residual oversight. With the 8-hour residual, loaded service margin at 78 hours falls below 65%. The thicker book is on CapacityTransition."),
        ("Assumption requiring validation", "Founder bridge of 24 hours", "Planning cap. Not a timesheet."),
        ("Assumption requiring validation", "Attach rates on ServiceForecast36", "Unchanged. They still describe an Essential-weighted book, which now matches founder-led delivery and does not assume Advanced is the default."),
        ("Assumption requiring validation", "Workers compensation and other on-cost", "1% and 2% are hypotheses. Payroll tax stays off until the threshold is crossed."),
        ("Assumption requiring validation", "FX", "RBA AUDUSD 0.7040 on 30 October 2026. Not a forecast."),
        ("Assumption requiring validation", "No metered cohort", "Win rate, churn, hours, and tokens are not observed operating results."),
    ]
    for i, (klass, item, position) in enumerate(rows):
        r = 6 + i
        ws.cell(r, 1, klass)
        ws.cell(r, 2, item)
        ws.cell(r, 3, position).alignment = WRAP
        _paint(ws, r, 3)
        if klass == "Approved strategic direction":
            ws.cell(r, 1).fill = PatternFill("solid", fgColor="E2EFDA")
        elif klass == "Proposed commercial terms":
            ws.cell(r, 1).fill = INPUT_FILL
        elif klass == "Unresolved":
            ws.cell(r, 1).fill = PatternFill("solid", fgColor="FCE4D6")
        else:
            ws.cell(r, 1).fill = PatternFill("solid", fgColor="D6E3F0")
    ws.column_dimensions["A"].width = 36
    ws.column_dimensions["B"].width = 48
    ws.column_dimensions["C"].width = 110
    ws.auto_filter.ref = f"A5:C{5 + len(rows)}"
    ws.freeze_panes = "A6"
    ws.sheet_properties.tabColor = NAVY
    ws.sheet_view.showGridLines = False
    ws.auto_filter.ref = f"A5:C{5 + len(rows)}"
