# US finder decision rules

**Status:** implemented engine, no public UI  
**Source:** section 11 of `selectyoursauna_us_implementation_plan_v2.md`

The finder evaluates exact product configurations. Its three result groups are `meets-known-criteria`, `needs-verification`, and `excluded`. A known match describes only the criteria selected by the user and never represents building or electrical approval.

| User criterion | Documented configuration | Engine result |
|---|---|---|
| 120 V supply only | Every required component in one supply option uses 120 V | Known criterion met |
| 120 V supply only | One option jointly requires 120 V and 240 V | Excluded |
| 120 V and 240 V supplies | One option jointly requires both voltages | Known criterion met |
| Voltage selected | Voltage matches; unrequested circuit or plug facts are unknown | Voltage criterion met; no installation approval |
| Maximum circuit selected | Required circuit is unknown | Needs verification |
| 240 V selected | One documented alternative supply option matches | That exact option is selected |
| Wood-fired | Product is documented as electric only | Excluded |
| Four seated people | Documented seated capacity is three | Excluded |
| Hard room envelope | Cabinet exceeds the dimensions | Excluded |
| Cabinet fits | Minimum installation clearances are unknown | Needs verification |
| Hard budget for complete package | Current complete package is within the limit | Known criterion met |
| Hard budget for complete package | Only a cheaper cabin/kit or incomplete offer exists | Needs verification |
| Hard budget | Price is missing, quote-only, unavailable, discontinued, or older than 30 days | Needs verification |
| Soft preference | Documented mismatch | Product remains in the result set with an unmet preference |

Alternative electrical supply options are OR branches. Requirements within one option are AND conditions. Dimensions are converted to inches before comparison and width/depth are swapped only when the caller explicitly enables rotation. Budget comparisons never combine different price scopes and never use affiliate status or commission for ranking.

The engine emits stable reason codes for the UI instead of prewritten recommendation copy. This keeps explanations reviewable and lets the later UI use natural, context-specific language.
