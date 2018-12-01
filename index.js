// Utilities

const toggleNull = (obj, key, val) => {
  if (obj[key] !== val) {
    obj[key] = val;
  } else {
    obj[key] = null;
  }
};

const isIndictable = offenceCategory =>
      offenceCategory === 'indictable'
      || offenceCategory === 's469'
      || offenceCategory === 's553';

const checkRequirements = (requirements, circumstances) => {
  passes = true;
  for (key in requirements) {
    req = requirements[key];
    if (typeof req === 'function') {
      passes = req(circumstances[key]);
    } else {
      passes = req === circumstances[key];
    }
  }
};

// Model

const nodes = {
  whoArresting: {
    label: "Who is making the arrest?",
    requires: {
      arrestingPerson: null
    }
  },
  citizenArresting: {
    label: "Lawful where:",
    requires: {
      arrestingPerson: p => p === null || p === 'citizen'
    },
    click: circumstances => toggleNull(circumstances, 'arrestingPerson', 'citizen')
  },
  citizenFoundCommitting: {
    label: "Found the person committing\nan indictable offence [s. 494(1)(a)]"
  },
  citizenPursuit: {
    label: "Accused being pursued",
    detail: "The citizen has reasonable grounds to believe the person has committed a criminal offence (of any type) and is escaping from and freshly pursued by someone with lawful authority to arrest them [s. 494(1)(b)]"
  },
  citizenProperty: {
    label: "Offence committed in regard\nto citizen's property",
    detail: "The citizen is the owner or lawful possessor of property (or their authorized agent) and they found the person committing any offence in regard to their property (a) at the time of the offence or (b) within a reasonable time after the offence, if it wasn't feasible to get a police officer [s. 494(2)]."
  },
  citizenReleaseToPeaceOfficer: {
    label: "The person must be delivered\nforthwith to a peace officer [s. 494(3)]."
  },
  policeArresting: {
    label: "Is there a warrant?"
  },
  policeArrestWarrant: {
    label: "Police may arrest"
  },
  policeWarrantless: {
    label: "Lawful where:"
  },
  policeIndictable: {
    label: "The person has committed\nor is about to commit\nan indictable offence"
  },
  policeInAct: {
    label: "Police find the person\ncommittinga criminal offence\n(of any type)"
  },
  policeBelieveWarrant: {
    label: "Police believe person\nis subject to a warrant"
  },
  policeWarrantlessCategory: {
    label: "Is the offence a s. 553, hybrid,\nor summary conviction offence?"
  },
  policeWarrantlessPublic: {
    label: "Can the public interest be\nsatisfied without arrest?",
    detail: "Officer must have reasonable grounds to believe it can - criteria set out in s. 495(2)(d)(i-iii) and s. 495(2)(e)."
  },
  policeAppearanceNotice: {
    label: "Police shall issue an appearance notice",
    detail: "[s. 496] Although they do technically still have the power to make an arrest under s. 495(1)."
  },
  policeArrestWarrantless: {
    label: "Police may arrest"
  },
  warrantApplication: {
    label: "Justice may, after reviewing an information:"
  },
  summons: {
    label: "Issue a summons",
    detail: "Must be served personally"
  },
  warrantIssue: {
    label: "Issue a warrant",
    details: "Occurs where the justice has reasonable grounds to believe that it is necessary in the public interest [s. 507(4)]"
  },
  releaseWarrantEndorsement: {
    label: "Has the judge endorsed the warrant?"
  },
  releaseWarrantEndorsed: {
    label: "May release subject to conditions",
    detail: "Officer in charge can release subject to a number of possible conditions including promises to appear or entering into a recognizance [s. 499]."
  },
  releaseOffenceCategory: {
    label: "Release depends on offence"
  },
  releaseSummary: {
    label: "s. 553, hybrid, or summary offence"
  },
  releaseIndictable: {
    label: "Indictable offence other than s. 469 or s. 553"
  },
  releaseIndictableLess5: {
    label: "Punishable by five years or less"
  },
  releaseIndictableGreater5: {
    label: "Punishable by more than five years"
  },
  release469: {
    label: "s. 469 offence"
  },
  releaseSuperiorOnly: {
    label: "Only a superior court judge\ncan authorize release [s. 522]"
  },
  releaseArrestingOfficerDecision: {
    label: "Arresting officer: Is detention\nnecessary in the public interest?",
    detail: "[s. 497(1)] Public interest criteria are listed in s. 497(1.1)(a) and (b)"
  },
  releaseArrestingOfficer: {
    label: "Arresting officer shall release\nwith the intention to obtain a\nsummons or with an appearance notice"
  },
  releaseOfficerInChargeDecision: {
    label: "Officer in charge: Is detention\nnecessary in the public interest?",
    detail: "[s. 498(1)] Public interest criteria listed in s. 498(1.1)(a) and (b)"
  },
  releaseOfficerInCharge: {
    label: "Officer in charge shall release\nthe person with conditions",
    detail: "OIC can release with intention to obtain a summons, upon a promise to appear, or upon the person entering into a recognizance. OIC may impose other conditions and undertakings, e.g. no communication with certain parties, report to an officer, no weapons [s. 503(2) and (2.1)]"
  },
  releaseJustice: {
    label: "Police must bring person before a justice",
    detail: "Must happen as soon as possible, within 24 hours if a justice is available [s. 503(1)]. Bail is governed by s. 515."
  }
};

const edges = [
  { label: "Citizen", from: 'whoArresting', to: 'citizenArresting' },
  { label: "Police officer", from: 'whoArresting', to: 'policeArresting' },
  { from: 'citizenArresting', to: 'citizenFoundCommitting' },
  { from: 'citizenArresting', to: 'citizenPursuit' },
  { from: 'citizenArresting', to: 'citizenProperty' },
  { from: 'citizenFoundCommitting', to: 'citizenReleaseToPeaceOfficer' },
  { from: 'citizenPursuit', to: 'citizenReleaseToPeaceOfficer' },
  { from: 'citizenProperty', to: 'citizenReleaseToPeaceOfficer' },
  { from: 'citizenReleaseToPeaceOfficer', to: 'policeWarrantlessCategory' },
  { from: 'policeArresting', to: 'policeArrestWarrant', label: "Yes" },
  { from: 'policeArresting', to: 'policeWarrantless', label: "No" },
  { from: 'policeWarrantless', to: 'policeIndictable' },
  { from: 'policeWarrantless', to: 'policeInAct' },
  { from: 'policeWarrantless', to: 'policeBelieveWarrant' },
  { from: 'policeIndictable', to: 'policeWarrantlessCategory' },
  { from: 'policeInAct', to: 'policeWarrantlessCategory' },
  { from: 'policeBelieveWarrant', to: 'policeWarrantlessCategory' },
  { from: 'policeWarrantlessCategory', to: 'policeWarrantlessPublic', label: "Yes" },
  { from: 'policeWarrantlessCategory', to: 'policeArrestWarrantless', label: "No" },
  { from: 'policeWarrantlessPublic', to: 'policeAppearanceNotice', label: "Yes" },
  { from: 'policeWarrantlessPublic', to: 'policeArrestWarrantless', label: "No" },
  { from: 'warrantApplication', to: 'summons' },
  { from: 'warrantApplication', to: 'warrantIssue' },
  { from: 'warrantIssue', to: 'policeArresting' },
  { from: 'policeArrestWarrant', to: 'releaseWarrantEndorsement' },
  { from: 'releaseWarrantEndorsement', to: 'releaseWarrantEndorsed', label: "Yes" },
  { from: 'releaseWarrantEndorsement', to: 'releaseOffenceCategory', label: "No" },
  { from: 'warrantIssue', to: 'policeArresting' },
  { from: 'policeArrestWarrantless', to: 'releaseOffenceCategory' },
  { from: 'releaseOffenceCategory', to: 'release469' },
  { from: 'release469', to: 'releaseSuperiorOnly' },
  { from: 'releaseOffenceCategory', to: 'releaseSummary' },
  { from: 'releaseOffenceCategory', to: 'releaseIndictable' },
  { from: 'releaseIndictable', to: 'releaseIndictableLess5' },
  { from: 'releaseIndictable', to: 'releaseIndictableGreater5' },
  { from: 'releaseIndictableLess5', to: 'releaseOfficerInChargeDecision' },
  { from: 'releaseIndictableGreater5', to: 'releaseJustice' },
  { from: 'releaseSummary', to: 'releaseArrestingOfficerDecision' },
  { from: 'releaseArrestingOfficerDecision', to: 'releaseArrestingOfficer', label: "No" },
  { from: 'releaseArrestingOfficerDecision', to: 'releaseOfficerInChargeDecision', label: "Yes" },
  { from: 'releaseOfficerInChargeDecision', to: 'releaseOfficerInCharge', label: "No" },
];

const circumstances = {
  arrestingPerson: null, // 'citizen' | 'police'
  warrant: null, // true | false
  offenceCategory: null // 'summary' | 'hybrid' | 'indictable' | 's469' | 's553'
};

// Set up graph

const graph = new dagreD3.graphlib.Graph().setGraph({});

for (key in nodes) {
  graph.setNode(key, nodes[key]);
}

for (key in edges) {
  const edge = edges[key];
  graph.setEdge(edge.from, edge.to, { label: edge.label });
}

// Render

const svg = d3.select('svg');
const inner = svg.append('g');

const render = new dagreD3.render();
render(inner, graph);
