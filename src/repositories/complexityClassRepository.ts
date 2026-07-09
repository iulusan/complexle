import { ComplexityClass } from "../domain/complexityClass";
import {
  CategoricalComparison,
  InclusionEdge,
  OrderComparison,
  PropertyDefinition,
  TotalOrderProperty,
} from "../domain/property";

// Sentinel total-order value meaning "this question doesn't apply to this class" (e.g. Uniformity
// for a class with no circuit characterization). Never ranked: compares as "equal" against another
// N/A (both genuinely share "not applicable"), otherwise "incomparable" against any real tier.
const NOT_APPLICABLE = "N/A";

// Placeholder seed data to exercise the full stack end to end.
// Real class roster (Complexity Zoo scale) to be supplied separately.
const PROPERTY_DEFINITIONS: PropertyDefinition[] = [
  {
    id: "inclusion",
    label: "Inclusion",
    kind: "partial-order",
    // "higher" means the guess properly contains the target, so the target is Smaller; "lower" means
    // the guess is properly contained in the target, so the target is Larger.
    directionLabels: { higher: "Smaller", lower: "Larger" },
  },
  { id: "model", label: "Model", kind: "categorical-multi" },
  { id: "type", label: "Type", kind: "categorical" },
  {
    id: "advice",
    label: "Advice",
    kind: "total-order",
    tiers: ["None", "O(1)", "O(log n)", "Polynomial", "Exponential/unbounded"],
    // "higher" means the guess has more advice than the target, so the target needs Less Advice; and vice versa.
    directionLabels: { higher: "Less Advice", lower: "More Advice" },
  },
  {
    id: "uniformity",
    label: "Uniformity",
    kind: "total-order",
    // DLOGTIME and ALOGTIME-uniformity are proven equivalent (Barrington–Immerman–Straubing) for the
    // classes we'd tag with them, so only one tier is used rather than asserting a false ordering
    // between them. "N/A" (NOT_APPLICABLE) is intentionally not listed here — see compareTotalOrder.
    tiers: ["DLOGTIME", "AC^0", "L", "P", "Non-Uniform"],
    // "higher" means the guess is looser/less uniform than the target, so the target needs a tighter
    // (More Uniform) generating model; and vice versa.
    directionLabels: { higher: "More Uniform", lower: "Less Uniform" },
  },
  { id: "oracle", label: "Oracle", kind: "categorical" },
  { id: "promise", label: "Promise", kind: "categorical" },
];

const CLASSES: ComplexityClass[] = [
  {
    id: "p",
    name: "P",
    aliases: ["p"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "al",
    name: "AL",
    aliases: ["al"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["ATM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // AL = P (Chandra–Kozen–Stockmeyer alternation theorem).
    equivalentClassIds: ["p"],
  },
  {
    id: "np",
    name: "NP",
    aliases: ["np"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "up",
    name: "UP",
    // Unambiguous NP — an NTM with at most one accepting computation path per input.
    aliases: ["up"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "conp",
    name: "coNP",
    aliases: ["conp", "co-np"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["ATM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "bpp",
    name: "BPP",
    aliases: ["bpp"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["PTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "zpp",
    name: "ZPP",
    aliases: ["zpp"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["PTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "rp",
    name: "RP",
    aliases: ["rp"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["PTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "corp",
    name: "coRP",
    aliases: ["corp", "co-rp"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["PTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "pp",
    name: "PP",
    aliases: ["pp"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["PTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "bqp",
    name: "BQP",
    aliases: ["bqp"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Quantum"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "p-sharp-p",
    name: "P^#P",
    aliases: ["p^#p", "p#p"],
    categoricalValues: { type: "Decision", oracle: "Yes", promise: "Total" },
    categoricalSetValues: { model: ["TM with Oracle"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "p-pp",
    name: "P^PP",
    aliases: ["p^pp", "ppp"],
    categoricalValues: { type: "Decision", oracle: "Yes", promise: "Total" },
    categoricalSetValues: { model: ["TM with Oracle"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // P^PP = P^#P (a #P oracle and a PP oracle simulate each other via binary search/thresholding).
    equivalentClassIds: ["p-sharp-p"],
  },
  {
    id: "ma",
    name: "MA",
    aliases: ["ma"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "am",
    name: "AM",
    aliases: ["am"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "qma",
    name: "QMA",
    // Quantum analogue of MA — Merlin's witness is a quantum state.
    aliases: ["qma"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive", "Quantum"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "qam",
    name: "QAM",
    // Quantum analogue of AM — Merlin's response is a quantum state.
    aliases: ["qam"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive", "Quantum"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "sigma-2-p",
    name: "Σ_2^P",
    aliases: ["sigma2p", "sigma_2^p", "σ2p", "σ_2^p", "sigma-2-p"],
    categoricalValues: { type: "Decision", oracle: "Yes", promise: "Total" },
    // Equivalently defined as poly-time TMs with a constant (here, two) number of alternations.
    categoricalSetValues: { model: ["TM with Oracle", "ATM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "pi-2-p",
    name: "Π_2^P",
    aliases: ["pi2p", "pi_2^p", "π2p", "π_2^p", "pi-2-p"],
    categoricalValues: { type: "Decision", oracle: "Yes", promise: "Total" },
    // Equivalently defined as poly-time TMs with a constant (here, two) number of alternations.
    categoricalSetValues: { model: ["TM with Oracle", "ATM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "ph",
    name: "PH",
    aliases: ["ph"],
    categoricalValues: { type: "Decision", oracle: "Yes", promise: "Total" },
    // Equivalently, poly-time TMs with a constant (per-language) number of alternations.
    categoricalSetValues: { model: ["TM with Oracle", "ATM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "pspace",
    name: "PSPACE",
    aliases: ["pspace"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "ap",
    name: "AP",
    aliases: ["ap"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["ATM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // AP = PSPACE (alternation theorem).
    equivalentClassIds: ["pspace"],
  },
  {
    id: "npspace",
    name: "NPSPACE",
    aliases: ["npspace"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // NPSPACE = PSPACE (Savitch's theorem).
    equivalentClassIds: ["pspace"],
  },
  {
    id: "sharp-p",
    name: "#P",
    aliases: ["#p", "sharp-p", "sharpp"],
    categoricalValues: { type: "Function", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "sharp-l",
    name: "#L",
    // Counts accepting paths of an NL machine, the log-space analogue of #P.
    aliases: ["#l", "sharp-l", "sharpl"],
    categoricalValues: { type: "Function", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "sharp-ac0",
    name: "#AC^0",
    // Counting analogue of #P for non-uniform AC^0 circuits.
    aliases: ["#ac0", "#ac^0", "sharp-ac0", "sharpac0"],
    categoricalValues: { type: "Function", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "fp",
    name: "FP",
    // The function-problem analogue of P.
    aliases: ["fp"],
    categoricalValues: { type: "Function", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "fnp",
    name: "FNP",
    // The function-problem analogue of NP.
    aliases: ["fnp"],
    categoricalValues: { type: "Function", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "fbpp",
    name: "FBPP",
    // The function-problem analogue of BPP.
    aliases: ["fbpp"],
    categoricalValues: { type: "Function", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["PTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "fbqp",
    name: "FBQP",
    // The function-problem analogue of BQP.
    aliases: ["fbqp"],
    categoricalValues: { type: "Function", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Quantum"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "nc0",
    name: "NC^0",
    aliases: ["nc0", "nc^0"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "ac0",
    name: "AC^0",
    aliases: ["ac0", "ac^0"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "acc0",
    name: "ACC^0",
    // AC^0 augmented with unbounded-fan-in MODm gates for any fixed m; "ACC" is a common shorthand.
    aliases: ["acc0", "acc^0", "acc"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "tc0",
    name: "TC^0",
    aliases: ["tc0", "tc^0"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "nc1",
    name: "NC^1",
    aliases: ["nc1", "nc^1"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "ac1",
    name: "AC^1",
    aliases: ["ac1", "ac^1"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "nc2",
    name: "NC^2",
    aliases: ["nc2", "nc^2"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "ac2",
    name: "AC^2",
    aliases: ["ac2", "ac^2"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "u-dlogtime-nc0",
    name: "U_DLOGTIME-NC^0",
    // Same circuit family as NC^0, but the circuit-generating function must run in DLOGTIME.
    aliases: ["u_dlogtime-nc^0", "u_dlogtime-nc0", "udlogtimenc0"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
  },
  {
    id: "u-dlogtime-nc1",
    name: "U_DLOGTIME-NC^1",
    aliases: ["u_dlogtime-nc^1", "u_dlogtime-nc1", "udlogtimenc1"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
    // U_DLOGTIME-NC^1 = ALOGTIME (Barrington–Immerman–Straubing).
    equivalentClassIds: ["alogtime"],
  },
  {
    id: "u-dlogtime-nc2",
    name: "U_DLOGTIME-NC^2",
    aliases: ["u_dlogtime-nc^2", "u_dlogtime-nc2", "udlogtimenc2"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
  },
  {
    id: "u-dlogtime-nc",
    name: "U_DLOGTIME-NC",
    aliases: ["u_dlogtime-nc", "udlogtimenc"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
  },
  {
    id: "u-dlogtime-ac0",
    name: "U_DLOGTIME-AC^0",
    // The DLOGTIME-uniform version of AC^0, same pattern as the U_DLOGTIME-NC^i entries.
    aliases: ["u_dlogtime-ac^0", "u_dlogtime-ac0", "udlogtimeac0"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
  },
  {
    id: "u-dlogtime-ac1",
    name: "U_DLOGTIME-AC^1",
    aliases: ["u_dlogtime-ac^1", "u_dlogtime-ac1", "udlogtimeac1"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
  },
  {
    id: "u-dlogtime-ac2",
    name: "U_DLOGTIME-AC^2",
    aliases: ["u_dlogtime-ac^2", "u_dlogtime-ac2", "udlogtimeac2"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
  },
  {
    id: "u-dlogtime-ac",
    name: "U_DLOGTIME-AC",
    aliases: ["u_dlogtime-ac", "udlogtimeac"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
    // U_DLOGTIME-AC = U_DLOGTIME-NC — same union-level collapse as AC = NC, holds regardless of uniformity.
    equivalentClassIds: ["u-dlogtime-nc"],
  },
  {
    id: "u-dlogtime-sac0",
    name: "U_DLOGTIME-SAC^0",
    // The DLOGTIME-uniform version of SAC^0, same pattern as the other U_DLOGTIME-* entries.
    aliases: ["u_dlogtime-sac^0", "u_dlogtime-sac0", "udlogtimesac0"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
  },
  {
    id: "u-dlogtime-sac1",
    name: "U_DLOGTIME-SAC^1",
    aliases: ["u_dlogtime-sac^1", "u_dlogtime-sac1", "udlogtimesac1"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
  },
  {
    id: "u-dlogtime-sac",
    name: "U_DLOGTIME-SAC",
    aliases: ["u_dlogtime-sac", "udlogtimesac"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
    // U_DLOGTIME-SAC = U_DLOGTIME-NC = U_DLOGTIME-AC — same union-level collapse.
    equivalentClassIds: ["u-dlogtime-nc"],
  },
  {
    id: "u-dlogtime-acc0",
    name: "U_DLOGTIME-ACC^0",
    // The DLOGTIME-uniform version of ACC^0, same pattern as the other U_DLOGTIME-* entries.
    aliases: ["u_dlogtime-acc^0", "u_dlogtime-acc0", "udlogtimeacc0"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
  },
  {
    id: "u-dlogtime-tc0",
    name: "U_DLOGTIME-TC^0",
    aliases: ["u_dlogtime-tc^0", "u_dlogtime-tc0", "udlogtimetc0"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "None", uniformity: "DLOGTIME" },
  },
  {
    id: "lh",
    name: "LH",
    // The LOGTIME hierarchy — alternating TM with O(log n) time and a constant number of alternations.
    aliases: ["lh"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["ATM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // LH = (DLOGTIME-uniform) AC^0 (Barrington–Immerman–Straubing).
    equivalentClassIds: ["u-dlogtime-ac0"],
  },
  {
    id: "fo-arb",
    name: "FO[Arb]",
    // First-order logic with arbitrary numerical predicates as built-ins — the "non-uniform" end.
    aliases: ["fo[arb]", "foarb"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Descriptive"] },
    totalOrderValues: { advice: "None", uniformity: "Non-Uniform" },
    // FO[Arb] = AC^0.
    equivalentClassIds: ["ac0"],
  },
  {
    id: "fo",
    name: "FO",
    // Plain first-order logic (only +, × as built-in numerical predicates) — Immerman's theorem.
    aliases: ["fo"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Descriptive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // FO = (DLOGTIME-uniform) AC^0 (Immerman) — proven equal.
    equivalentClassIds: ["u-dlogtime-ac0"],
  },
  {
    id: "fo-dtc",
    name: "FO(DTC)",
    // First-order logic plus a deterministic transitive closure operator.
    aliases: ["fo(dtc)", "fodtc"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Descriptive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // FO(DTC) = L — proven equal.
    equivalentClassIds: ["l"],
  },
  {
    id: "fo-tc",
    name: "FO(TC)",
    // First-order logic plus a (nondeterministic) transitive closure operator.
    aliases: ["fo(tc)", "fotc"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Descriptive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // FO(TC) = NL — proven equal.
    equivalentClassIds: ["nl"],
  },
  {
    id: "fo-lfp",
    name: "FO(LFP)",
    // First-order logic plus a least-fixed-point operator (Immerman–Vardi; ordered structures only, glossed over).
    aliases: ["fo(lfp)", "folfp"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Descriptive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // FO(LFP) = P — proven equal (Immerman–Vardi).
    equivalentClassIds: ["p"],
  },
  {
    id: "so-exists",
    name: "SO∃",
    // Second-order logic, existential second-order quantifiers only — Fagin's theorem.
    aliases: ["so-exists", "soexists", "so∃"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Descriptive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // SO∃ = NP (Fagin's theorem) — proven equal.
    equivalentClassIds: ["np"],
  },
  {
    id: "so-forall",
    name: "SO∀",
    // Second-order logic restricted to universal second-order quantifiers only — dual of Fagin's theorem.
    aliases: ["so-forall", "soforall", "so∀"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Descriptive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // SO∀ = coNP — proven equal.
    equivalentClassIds: ["conp"],
  },
  {
    id: "so",
    name: "SO",
    // Full second-order logic, with second-order quantifiers of both kinds allowed and unrestricted alternation.
    aliases: ["so"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Descriptive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // SO = PH — proven equal.
    equivalentClassIds: ["ph"],
  },
  {
    id: "so-tc",
    name: "SO(TC)",
    // Second-order logic augmented with a transitive closure operator.
    aliases: ["so(tc)", "sotc"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Descriptive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // SO(TC) = PSPACE — proven equal.
    equivalentClassIds: ["pspace"],
  },
  {
    id: "so-lfp",
    name: "SO(LFP)",
    // Second-order logic augmented with a least-fixed-point operator.
    aliases: ["so(lfp)", "solfp"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Descriptive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // SO(LFP) = EXP — proven equal.
    equivalentClassIds: ["exp"],
  },
  {
    id: "nc",
    name: "NC",
    aliases: ["nc"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "ac",
    name: "AC",
    aliases: ["ac"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
    // AC = NC — the hierarchies coincide at the union/limit level (unlike any fixed AC^i vs. NC^i).
    equivalentClassIds: ["nc"],
  },
  {
    id: "sac0",
    name: "SAC^0",
    // Semi-unbounded fan-in: unbounded-fan-in OR gates, but bounded (fan-in 2) AND gates.
    aliases: ["sac0", "sac^0"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "sac1",
    name: "SAC^1",
    aliases: ["sac1", "sac^1"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "sac",
    name: "SAC",
    aliases: ["sac"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
    // SAC = NC = AC — same union-level collapse as AC = NC.
    equivalentClassIds: ["nc"],
  },
  {
    id: "p-log",
    name: "P/log",
    aliases: ["p/log", "plog"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM with Advice"] },
    totalOrderValues: { advice: "O(log n)", uniformity: "Non-Uniform" },
  },
  {
    id: "p-poly",
    name: "P/poly",
    aliases: ["p/poly", "ppoly"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Circuit", "TM with Advice"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "np-poly",
    name: "NP/poly",
    aliases: ["np/poly", "nppoly"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM", "TM with Advice"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "ip",
    name: "IP",
    aliases: ["ip"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // IP = PSPACE (Shamir's theorem).
    equivalentClassIds: ["pspace"],
  },
  {
    id: "qip",
    name: "QIP",
    aliases: ["qip"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive", "Quantum"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // QIP = PSPACE (Jain–Ji–Upadhyay–Watrous) — IP with quantum messages.
    equivalentClassIds: ["pspace"],
  },
  {
    id: "pzk",
    name: "PZK",
    // Perfect Zero-Knowledge — verifier learns nothing beyond the statement's truth, in the
    // strictest (perfect) sense.
    aliases: ["pzk"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "szk",
    name: "SZK",
    // Statistical Zero-Knowledge — relaxation of PZK to statistical indistinguishability.
    aliases: ["szk"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "czk",
    name: "CZK",
    // Computational Zero-Knowledge — relaxation to computational indistinguishability.
    aliases: ["czk"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "pcp-log-1",
    name: "PCP(log,1)",
    aliases: ["pcp(log,1)", "pcplog1"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // PCP(log,1) = NP — the PCP theorem (Arora–Safra; Arora–Lund–Motwani–Sudan–Szegedy).
    equivalentClassIds: ["np"],
  },
  {
    id: "pcp-poly-poly",
    name: "PCP(poly,poly)",
    aliases: ["pcp(poly,poly)", "pcppolypoly"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // PCP(poly,poly) = MIP — same PCP framework with poly randomness/query budgets.
    equivalentClassIds: ["mip"],
  },
  {
    id: "dlogtime",
    name: "DLOGTIME",
    aliases: ["dlogtime"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "alogtime",
    name: "ALOGTIME",
    aliases: ["alogtime"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["ATM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "l",
    name: "L",
    aliases: ["l", "logspace"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "l-log",
    name: "L/log",
    aliases: ["l/log", "llog"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM with Advice"] },
    totalOrderValues: { advice: "O(log n)", uniformity: "Non-Uniform" },
  },
  {
    id: "l-poly",
    name: "L/poly",
    aliases: ["l/poly", "lpoly"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM with Advice"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "nl-poly",
    name: "NL/poly",
    aliases: ["nl/poly", "nlpoly"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM", "TM with Advice"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "ul",
    name: "UL",
    // Unambiguous NL — an NTM with at most one accepting computation path per input.
    aliases: ["ul"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "nl",
    name: "NL",
    aliases: ["nl"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "conl",
    name: "coNL",
    aliases: ["conl", "co-nl"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["ATM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // coNL = NL (Immerman–Szelepcsényi theorem).
    equivalentClassIds: ["nl"],
  },
  {
    id: "logcfl",
    name: "LOGCFL",
    // Languages logspace many-one reducible to a context-free language.
    aliases: ["logcfl"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Reducibility"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // LOGCFL = SAC^1 (Venkateswaran) only in the uniform case — hence ≡ the uniform entry, not plain SAC^1.
    equivalentClassIds: ["u-dlogtime-sac1"],
  },
  {
    id: "logcfl-poly",
    name: "LOGCFL/poly",
    aliases: ["logcfl/poly", "logcflpoly"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Reducibility"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
    // LOGCFL/poly = SAC^1 — advice supplies exactly the non-uniform power LOGCFL alone lacks.
    equivalentClassIds: ["sac1"],
  },
  {
    id: "det",
    name: "DET",
    // Languages logspace many-one reducible to computing the integer determinant.
    aliases: ["det"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Reducibility"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "rl",
    name: "RL",
    aliases: ["rl"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["PTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "corl",
    name: "coRL",
    aliases: ["corl", "co-rl"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["PTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "bpl",
    name: "BPL",
    aliases: ["bpl"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["PTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "pl",
    name: "PL",
    // Unbounded-error probabilistic log-space — PP's relationship to P, one level down.
    aliases: ["pl"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["PTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "sc",
    name: "SC",
    // "Steve's Class" (Steven Cook) — simultaneously poly-time and polylog-space.
    aliases: ["sc", "steve's class", "steves class"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "exp",
    name: "EXP",
    aliases: ["exp", "exptime"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "exp-poly",
    name: "EXP/poly",
    aliases: ["exp/poly", "exppoly"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM with Advice"] },
    totalOrderValues: { advice: "Polynomial", uniformity: "Non-Uniform" },
  },
  {
    id: "apspace",
    name: "APSPACE",
    aliases: ["apspace"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["ATM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // APSPACE = EXP (alternation theorem).
    equivalentClassIds: ["exp"],
  },
  {
    id: "nexp",
    name: "NEXP",
    aliases: ["nexp", "nexptime"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "expspace",
    name: "EXPSPACE",
    aliases: ["expspace"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "nexpspace",
    name: "NEXPSPACE",
    aliases: ["nexpspace"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["NTM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // NEXPSPACE = EXPSPACE (Savitch's theorem).
    equivalentClassIds: ["expspace"],
  },
  {
    id: "mip",
    name: "MIP",
    aliases: ["mip"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // MIP = NEXP (Babai–Fortnow–Lund).
    equivalentClassIds: ["nexp"],
  },
  {
    id: "qmip",
    name: "QMIP",
    aliases: ["qmip"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive", "Quantum"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // QMIP = TR (RE) — quantum multi-prover interactive proofs.
    equivalentClassIds: ["tr"],
  },
  {
    id: "mip-star",
    name: "MIP*",
    aliases: ["mip*", "mipstar"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["Interactive", "Quantum"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
    // MIP* = RE = TR (Ji–Natarajan–Vidick–Wright–Yuen) — MIP with entangled provers.
    equivalentClassIds: ["tr"],
  },
  {
    id: "td",
    name: "TD",
    // R (Recursive) is the classical name for the same languages Sipser calls Turing-decidable.
    aliases: ["td", "r", "recursive", "decidable"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "tr",
    name: "TR",
    // RE (Recursively Enumerable) is the classical name for Turing-recognizable languages.
    aliases: ["tr", "re", "recursively enumerable", "turing-recognizable"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "cotr",
    name: "coTR",
    // coRE (co-Recursively-Enumerable) is the classical name for co-Turing-recognizable languages.
    aliases: ["cotr", "co-tr", "core", "co-re"],
    categoricalValues: { type: "Decision", oracle: "No", promise: "Total" },
    categoricalSetValues: { model: ["TM"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
  {
    id: "ah",
    name: "AH",
    aliases: ["ah", "arithmetic hierarchy"],
    categoricalValues: { type: "Decision", oracle: "Yes", promise: "Total" },
    categoricalSetValues: { model: ["TM with Oracle"] },
    totalOrderValues: { advice: "None", uniformity: NOT_APPLICABLE },
  },
];

// `from` is a known subset of `to`.
const INCLUSION_EDGES: InclusionEdge[] = [
  { from: "dlogtime", to: "alogtime" },
  { from: "alogtime", to: "l" },
  { from: "l", to: "l-log" },
  { from: "l", to: "ul" },
  { from: "ul", to: "nl" },
  { from: "l-log", to: "l-poly" },
  { from: "l-log", to: "p-log" },
  { from: "l-poly", to: "nl-poly" },
  { from: "nl-poly", to: "sac1" },
  { from: "l", to: "rl" },
  { from: "l", to: "corl" },
  { from: "rl", to: "nl" },
  { from: "corl", to: "nl" },
  { from: "rl", to: "bpl" },
  { from: "corl", to: "bpl" },
  { from: "bpl", to: "l-poly" },
  { from: "bpl", to: "sc" },
  { from: "bpl", to: "pl" },
  { from: "nl", to: "pl" },
  { from: "pl", to: "det" },
  { from: "sc", to: "p" },
  { from: "nl", to: "p" },
  { from: "p", to: "up" },
  { from: "up", to: "np" },
  { from: "nl", to: "nl-poly" },
  { from: "nl", to: "logcfl" },
  { from: "logcfl", to: "sac1" },
  { from: "det", to: "nc2" },
  { from: "sharp-l", to: "sharp-p" },
  { from: "sharp-ac0", to: "sharp-p" },
  { from: "fp", to: "fnp" },
  { from: "fp", to: "fbpp" },
  { from: "fbpp", to: "fbqp" },
  { from: "p", to: "zpp" },
  { from: "zpp", to: "rp" },
  { from: "zpp", to: "corp" },
  { from: "rp", to: "np" },
  { from: "rp", to: "bpp" },
  { from: "corp", to: "conp" },
  { from: "corp", to: "bpp" },
  { from: "bpp", to: "bqp" },
  { from: "bqp", to: "pp" },
  { from: "bpp", to: "p-poly" },
  { from: "conp", to: "pp" },
  { from: "pp", to: "p-sharp-p" },
  { from: "p-sharp-p", to: "pspace" },
  { from: "np", to: "ma" },
  { from: "bpp", to: "ma" },
  { from: "ma", to: "am" },
  { from: "ma", to: "sigma-2-p" },
  { from: "am", to: "pi-2-p" },
  { from: "am", to: "np-poly" },
  { from: "ma", to: "qma" },
  { from: "bqp", to: "qma" },
  { from: "qma", to: "qam" },
  { from: "qma", to: "pp" },
  { from: "am", to: "qam" },
  { from: "p-poly", to: "np-poly" },
  { from: "bpp", to: "pzk" },
  { from: "pzk", to: "szk" },
  { from: "szk", to: "czk" },
  { from: "czk", to: "ip" },
  { from: "szk", to: "am" },
  { from: "conp", to: "pi-2-p" },
  { from: "sigma-2-p", to: "ph" },
  { from: "pi-2-p", to: "ph" },
  { from: "ph", to: "p-sharp-p" },
  { from: "nc0", to: "sac0" },
  { from: "sac0", to: "ac0" },
  { from: "ac0", to: "acc0" },
  { from: "acc0", to: "tc0" },
  { from: "tc0", to: "nc1" },
  { from: "nc1", to: "sac1" },
  { from: "sac1", to: "ac1" },
  { from: "ac1", to: "nc2" },
  { from: "nc2", to: "ac2" },
  { from: "ac2", to: "nc" },
  { from: "nc", to: "p-poly" },
  { from: "u-dlogtime-nc0", to: "nc0" },
  { from: "u-dlogtime-nc1", to: "nc1" },
  { from: "u-dlogtime-nc2", to: "nc2" },
  { from: "u-dlogtime-nc", to: "nc" },
  { from: "u-dlogtime-acc0", to: "acc0" },
  { from: "u-dlogtime-tc0", to: "tc0" },
  { from: "u-dlogtime-ac0", to: "ac0" },
  { from: "u-dlogtime-ac1", to: "ac1" },
  { from: "u-dlogtime-ac2", to: "ac2" },
  { from: "u-dlogtime-ac", to: "ac" },
  { from: "u-dlogtime-sac0", to: "sac0" },
  { from: "u-dlogtime-sac1", to: "sac1" },
  { from: "u-dlogtime-sac", to: "sac" },
  { from: "u-dlogtime-nc1", to: "l" },
  { from: "u-dlogtime-nc", to: "p" },
  { from: "u-dlogtime-ac0", to: "u-dlogtime-acc0" },
  { from: "u-dlogtime-acc0", to: "u-dlogtime-tc0" },
  { from: "u-dlogtime-tc0", to: "u-dlogtime-nc1" },
  { from: "u-dlogtime-ac1", to: "u-dlogtime-nc2" },
  { from: "u-dlogtime-nc2", to: "u-dlogtime-ac2" },
  { from: "u-dlogtime-ac2", to: "u-dlogtime-ac" },
  { from: "u-dlogtime-ac", to: "u-dlogtime-nc" },
  { from: "u-dlogtime-nc0", to: "u-dlogtime-sac0" },
  { from: "u-dlogtime-sac0", to: "u-dlogtime-ac0" },
  { from: "u-dlogtime-nc1", to: "u-dlogtime-sac1" },
  { from: "u-dlogtime-sac1", to: "u-dlogtime-ac1" },
  { from: "u-dlogtime-sac1", to: "u-dlogtime-sac" },
  { from: "sac1", to: "sac" },
  { from: "sac", to: "p-poly" },
  { from: "p", to: "p-log" },
  { from: "p-log", to: "p-poly" },
  { from: "p-poly", to: "exp-poly" },
  { from: "exp", to: "exp-poly" },
  { from: "pspace", to: "exp" },
  { from: "exp", to: "nexp" },
  { from: "nexp", to: "expspace" },
  { from: "expspace", to: "td" },
  { from: "td", to: "tr" },
  { from: "td", to: "cotr" },
  { from: "tr", to: "ah" },
  { from: "cotr", to: "ah" },
];

export class ComplexityClassRepository {
  private readonly classesById = new Map<string, ComplexityClass>();
  private readonly reachability = new Map<string, Map<string, Set<string>>>();
  private readonly equivalenceRoot = new Map<string, string>();

  constructor() {
    for (const complexityClass of CLASSES) {
      this.classesById.set(complexityClass.id, complexityClass);
    }

    const classIds = [...this.classesById.keys()];
    const unionFind = new UnionFind(classIds);
    for (const complexityClass of CLASSES) {
      for (const equivalentId of complexityClass.equivalentClassIds ?? []) {
        unionFind.union(complexityClass.id, equivalentId);
      }
    }
    for (const id of classIds) this.equivalenceRoot.set(id, unionFind.find(id));

    const expandedEdges = expandEdgesAcrossEquivalences(INCLUSION_EDGES, classIds, (id) => this.equivalenceRoot.get(id) as string);
    this.reachability.set("inclusion", buildReachability(expandedEdges, classIds));
  }

  getAll(): ComplexityClass[] {
    return [...this.classesById.values()];
  }

  getPropertyDefinitions(): PropertyDefinition[] {
    return PROPERTY_DEFINITIONS;
  }

  findById(id: string): ComplexityClass | undefined {
    return this.classesById.get(id);
  }

  findByGuessText(text: string): ComplexityClass | undefined {
    const normalized = text.trim().toLowerCase();
    if (!normalized) return undefined;
    return this.getAll().find((c) => c.aliases.includes(normalized));
  }

  /** Every valid guess string (lowercased alias) mapped to its class's canonical display name —
   *  shipped to the client so it can tell a valid guess from an invalid one without a round trip. */
  getAliasIndex(): Record<string, string> {
    const index: Record<string, string> = {};
    for (const c of this.getAll()) {
      for (const alias of c.aliases) index[alias] = c.name;
    }
    return index;
  }

  /** Fuzzy-matches free text against class names/aliases for live search-as-you-type suggestions. */
  findMatches(query: string, limit = 8): ComplexityClass[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const scored = this.getAll()
      .map((c) => ({ complexityClass: c, score: bestFuzzyScore(trimmed, [c.name, ...c.aliases]) }))
      .filter((entry): entry is { complexityClass: ComplexityClass; score: number } => entry.score !== null);

    scored.sort((a, b) => b.score - a.score || a.complexityClass.name.localeCompare(b.complexityClass.name));
    return scored.slice(0, limit).map((entry) => entry.complexityClass);
  }

  getCategoricalValue(classId: string, propertyId: string): string | undefined {
    return this.classesById.get(classId)?.categoricalValues[propertyId];
  }

  getCategoricalSetValue(classId: string, propertyId: string): string[] {
    return this.classesById.get(classId)?.categoricalSetValues[propertyId] ?? [];
  }

  getTotalOrderValue(classId: string, propertyId: string): string | undefined {
    return this.classesById.get(classId)?.totalOrderValues[propertyId];
  }

  areEquivalent(guessId: string, targetId: string): boolean {
    if (guessId === targetId) return true;
    const guessRoot = this.equivalenceRoot.get(guessId);
    const targetRoot = this.equivalenceRoot.get(targetId);
    return guessRoot !== undefined && guessRoot === targetRoot;
  }

  compareOrder(propertyId: string, guessId: string, targetId: string): OrderComparison {
    if (guessId === targetId || this.areEquivalent(guessId, targetId)) return "equal";

    const reachability = this.reachability.get(propertyId);
    if (!reachability) return "incomparable";

    const guessReachesTarget = reachability.get(guessId)?.has(targetId) ?? false;
    const targetReachesGuess = reachability.get(targetId)?.has(guessId) ?? false;
    if (guessReachesTarget && targetReachesGuess) return "equal"; // mutual containment
    if (guessReachesTarget) return "lower"; // guess ⊆ target
    if (targetReachesGuess) return "higher"; // target ⊆ guess
    return "incomparable";
  }

  compareTotalOrder(propertyId: string, guessId: string, targetId: string): OrderComparison {
    const def = PROPERTY_DEFINITIONS.find((d): d is TotalOrderProperty => d.id === propertyId && d.kind === "total-order");
    const guessTier = this.getTotalOrderValue(guessId, propertyId);
    const targetTier = this.getTotalOrderValue(targetId, propertyId);
    if (!def || guessTier === undefined || targetTier === undefined) return "incomparable";
    if (guessTier === NOT_APPLICABLE && targetTier === NOT_APPLICABLE) return "equal";
    if (guessTier === NOT_APPLICABLE || targetTier === NOT_APPLICABLE) return "incomparable";

    const guessRank = def.tiers.indexOf(guessTier);
    const targetRank = def.tiers.indexOf(targetTier);
    if (guessRank === targetRank) return "equal";
    return guessRank < targetRank ? "lower" : "higher";
  }

  compareCategoricalSet(propertyId: string, guessId: string, targetId: string): CategoricalComparison {
    const guessValues = new Set(this.getCategoricalSetValue(guessId, propertyId));
    const targetValues = this.getCategoricalSetValue(targetId, propertyId);
    return targetValues.some((value) => guessValues.has(value)) ? "match" : "mismatch";
  }
}

class UnionFind {
  private readonly parent = new Map<string, string>();

  constructor(ids: string[]) {
    for (const id of ids) this.parent.set(id, id);
  }

  find(id: string): string {
    let root = id;
    while (this.parent.get(root) !== root) root = this.parent.get(root) as string;

    let current = id;
    while (current !== root) {
      const next = this.parent.get(current) as string;
      this.parent.set(current, root);
      current = next;
    }
    return root;
  }

  union(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent.set(rootA, rootB);
  }
}

/**
 * Proven-equal classes (e.g. IP = PSPACE) are modeled as separate entries with their own
 * defining Model/Advice/etc., but containment must still hold between them and propagate
 * to whatever each is connected to — otherwise e.g. "NP ⊆ PSPACE" wouldn't imply "NP ⊆ IP".
 */
function expandEdgesAcrossEquivalences(edges: InclusionEdge[], classIds: string[], rootOf: (id: string) => string): InclusionEdge[] {
  const groups = new Map<string, string[]>();
  for (const id of classIds) {
    const root = rootOf(id);
    const group = groups.get(root) ?? [];
    group.push(id);
    groups.set(root, group);
  }

  const expanded: InclusionEdge[] = [];
  for (const { from, to } of edges) {
    for (const f of groups.get(rootOf(from)) ?? [from]) {
      for (const t of groups.get(rootOf(to)) ?? [to]) {
        expanded.push({ from: f, to: t });
      }
    }
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    for (const a of group) {
      for (const b of group) {
        if (a !== b) expanded.push({ from: a, to: b });
      }
    }
  }

  return expanded;
}

function bestFuzzyScore(query: string, candidates: string[]): number | null {
  let best: number | null = null;
  for (const candidate of candidates) {
    const score = fuzzyScore(query, candidate);
    if (score !== null && (best === null || score > best)) best = score;
  }
  return best;
}

/** Higher is a better match; null means no match at all (not even a subsequence). */
function fuzzyScore(query: string, candidate: string): number | null {
  const q = query.toLowerCase();
  const c = candidate.toLowerCase();
  if (c === q) return 100;
  if (c.startsWith(q)) return 80;
  if (c.includes(q)) return 60;

  let qi = 0;
  for (let ci = 0; ci < c.length && qi < q.length; ci++) {
    if (c[ci] === q[qi]) qi++;
  }
  if (qi < q.length) return null;
  return 40 - Math.min(c.length - q.length, 39); // tighter subsequence matches score higher
}

function buildReachability(edges: InclusionEdge[], classIds: string[]): Map<string, Set<string>> {
  const directSupersets = new Map<string, Set<string>>();
  for (const id of classIds) directSupersets.set(id, new Set());
  for (const { from, to } of edges) directSupersets.get(from)?.add(to);

  const reachability = new Map<string, Set<string>>();
  for (const id of classIds) {
    const visited = new Set<string>();
    const stack = [...(directSupersets.get(id) ?? [])];
    while (stack.length > 0) {
      const next = stack.pop() as string;
      if (visited.has(next)) continue;
      visited.add(next);
      for (const further of directSupersets.get(next) ?? []) stack.push(further);
    }
    reachability.set(id, visited);
  }
  return reachability;
}
