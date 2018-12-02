// Utilities

const booleanFromString = str => {
  if (str === 'true') return true;
  if (str === 'false') return false;
  return null;
};

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

const isRelevant = (irrelevance, facts) => {
  for (key in irrelevance) {
    irrelevantIf = irrelevance[key];
    if (typeof irrelevantIf === 'function' && irrelevantIf(facts[key])) return false;
    if (irrelevantIf === facts[key]) return false;
  }

  return true;
};

// Model

const nodes = {
  whoArresting: {
    label: "Who is making the arrest?",
    irrelevance: {
      arrestingPerson: p => p !== null
    }
  },
  citizenArresting: {
    label: "Lawful where:",
    irrelevance: {
      arrestingPerson: 'police'
    },
    click: facts => toggleNull(facts, 'arrestingPerson', 'citizen')
  },
  citizenFoundCommitting: {
    label: "Found the person committing\nan indictable offence [s. 494(1)(a)]",
    irrelevance: {
      arrestingPerson: 'police'
    }
  },
  citizenPursuit: {
    label: "Accused being pursued",
    detail: "The citizen has reasonable grounds to believe the person has committed a criminal offence (of any type) and is escaping from and freshly pursued by someone with lawful authority to arrest them [s. 494(1)(b)]",
    irrelevance: {
      arrestingPerson: 'police'
    }
  },
  citizenProperty: {
    label: "Offence committed in regard\nto citizen's property",
    detail: "The citizen is the owner or lawful possessor of property (or their authorized agent) and they found the person committing any offence in regard to their property (a) at the time of the offence or (b) within a reasonable time after the offence, if it wasn't feasible to get a police officer [s. 494(2)].",
    irrelevance: {
      arrestingPerson: 'police'
    }
  },
  citizenReleaseToPeaceOfficer: {
    label: "The person must be delivered\nforthwith to a peace officer [s. 494(3)].",
    irrelevance: {
      arrestingPerson: 'police'
    }
  },
  policeArresting: {
    label: "Is there a warrant?",
    irrelevance: {
      arrestingPerson: 'citizen',
      warrant: false
    }
  },
  policeArrestWarrant: {
    label: "Police may arrest",
    irrelevance: {
      arrestingPerson: 'citizen',
      warrant: false
    }
  },
  policeWarrantless: {
    label: "Lawful where:",
    detail: "[s. 495(1)]",
    irrelevance: {
      arrestingPerson: 'citizen',
      warrant: true
    }
  },
  policeIndictable: {
    label: "The person has committed\nor is about to commit\nan indictable offence",
    irrelevance: {
      arrestingPerson: 'citizen',
      warrant: true
    }
  },
  policeInAct: {
    label: "Police find the person\ncommitting a criminal offence\n(of any type)",
    irrelevance: {
      arrestingPerson: 'citizen',
      warrant: true
    }
  },
  policeBelieveWarrant: {
    label: "Police believe person\nis subject to a warrant",
    irrelevance: {
      arrestingPerson: 'citizen',
      warrant: true
    }
  },
  policeWarrantlessCategory: {
    label: "Is the offence a s. 553, hybrid,\nor summary conviction offence?",
    irrelevance: {
      warrant: true
    }
  },
  policeWarrantlessPublic: {
    label: "Can the public interest be\nsatisfied without arrest?",
    detail: "Officer must have reasonable grounds to believe it can - criteria set out in s. 495(2)(d)(i-iii) and s. 495(2)(e).",
    irrelevance: {
      warrant: true,
      offenceCategory: c => _.includes(['s469', 'indictableShort', 'indictableLong'], c)
    }
  },
  policeAppearanceNotice: {
    label: "Police shall issue an appearance notice",
    detail: "[s. 496] Although they do technically still have the power to make an arrest under s. 495(1). This means that an arrest is still valid under the Criminal Code and the person may not resist, but they could bring a civil suit for assault or false imprisonment [s. 495(3)].",
    irrelevance: {
      warrant: true,
      offenceCategory: c => _.includes(['s469', 'indictableShort', 'indictableLong'], c)
    }
  },
  policeArrestWarrantless: {
    label: "Police may arrest",
    irrelevance: {
      warrant: true
    }
  },
  warrantApplication: {
    label: "Justice may, after reviewing an information:",
    detail: "Police or anyone else can lay an information before a justice, must make case to compel appearance of accused [s. 507(1)]",
    irrelevance: {
      arrestingPerson: 'citizen',
      warrant: false
    }
  },
  summons: {
    label: "Issue a summons",
    detail: "Must be served personally",
    irrelevance: {
      arrestingPerson: 'citizen',
      warrant: w => w !== null
    }
  },
  warrantIssue: {
    label: "Issue a warrant",
    detail: "Occurs where the justice has reasonable grounds to believe that it is necessary in the public interest [s. 507(4)]",
    irrelevance: {
      arrestingPerson: 'citizen',
      warrant: false
    }
  },
  releaseWarrantEndorsement: {
    label: "Has the judge endorsed the warrant?",
    irrelevance: {
      arrestingPerson: 'citizen',
      warrant: false
    }
  },
  releaseWarrantEndorsed: {
    label: "May release subject to conditions",
    detail: "Officer in charge can release subject to a number of possible conditions including promises to appear or entering into a recognizance [s. 499].",
    irrelevance: {
      arrestingPerson: 'citizen',
      warrant: false,
      offenceCategory: 's469'
    }
  },
  releaseOffenceCategory: {
    label: "Release depends on offence"
  },
  releaseSummary: {
    label: "s. 553, hybrid, or summary offence",
    irrelevance: {
      offenceCategory: c => !_.includes([null, 'summary', 'hybrid', 's553'], c)
    }
  },
  releaseIndictable: {
    label: "Indictable offence other than s. 469 or s. 553",
    irrelevance: {
      offenceCategory: c => !_.includes([null, 'indictableShort', 'indictableLong'], c)
    }
  },
  releaseIndictableLess5: {
    label: "Punishable by five years or less",
    irrelevance: {
      offenceCategory: c => c !== null && c !== 'indictableShort'
    }
  },
  releaseIndictableGreater5: {
    label: "Punishable by more than five years",
    irrelevance: {
      offenceCategory: c => c !== null && c !== 'indictableLong'
    }
  },
  release469: {
    label: "s. 469 offence",
    irrelevance: {
      offenceCategory: c => c !== null && c !== 's469'
    }
  },
  releaseSuperiorOnly: {
    label: "Only a superior court judge\ncan authorize release [s. 522]",
    irrelevance: {
      offenceCategory: c => c !== null && c !== 's469'
    }
  },
  releaseArrestingOfficerDecision: {
    label: "Arresting officer: Is detention\nnecessary in the public interest?",
    detail: "[s. 497(1)] Public interest criteria are listed in s. 497(1.1)(a) and (b)",
    irrelevance: {
      offenceCategory: c => _.includes(['s469', 'indictableShort', 'indictableLong'], c)
    }
  },
  releaseArrestingOfficer: {
    label: "Arresting officer shall release\nwith the intention to obtain a\nsummons or with an appearance notice",
    irrelevance: {
      offenceCategory: c => _.includes(['s469', 'indictableShort', 'indictableLong'], c)
    }
  },
  releaseOfficerInChargeDecision: {
    label: "Officer in charge: Is detention\nnecessary in the public interest?",
    detail: "[s. 498(1)] Public interest criteria listed in s. 498(1.1)(a) and (b)",
    irrelevance: {
      offenceCategory: c => _.includes(['s469', 'indictableLong'], c)
    }
  },
  releaseOfficerInCharge: {
    label: "Officer in charge shall release\nthe person with conditions",
    detail: "OIC can release with intention to obtain a summons, upon a promise to appear, or upon the person entering into a recognizance. OIC may impose other conditions and undertakings, e.g. no communication with certain parties, report to an officer, no weapons [s. 503(2) and (2.1)]",
    irrelevance: {
      offenceCategory: c => _.includes(['s469', 'indictableLong'], c)
    }
  },
  releaseJustice: {
    label: "Police must bring person before a justice",
    detail: "Must happen as soon as possible, within 24 hours if a justice is available [s. 503(1)]. Bail is governed by s. 515.",
    irrelevance: {
      offenceCategory: c => _.includes(['s469'], c)
    }
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
  { from: 'releaseOfficerInChargeDecision', to: 'releaseJustice', label: "Yes" },
];

// Set up graph

const createGraph = (nodes, edges, facts) => {
  const nodeViews = _.mapValues(nodes, node => {
    const view = Object.assign({}, node);
    if (!isRelevant(node.irrelevance, facts)) view.class = 'irrelevant';
    return view;
  });

  const graph = new dagreD3.graphlib.Graph().setGraph({});

  for (key in nodeViews) {
    graph.setNode(key, nodeViews[key]);
  }

  for (key in edges) {
    const edge = edges[key];
    graph.setEdge(edge.from, edge.to, { label: edge.label });
  }

  return graph;
};

// Render

const render = graph => {
  const dagreRender = new dagreD3.render();

  const svg = d3.select('svg').select('g');
  svg.selectAll('*').remove();

  dagreRender(svg, graph);

  // add tooltips

  svg.selectAll('.node')
    .each(function (nodeName) {
      const detail = graph.node(nodeName).detail;
      if (detail) {
        const width = d3.select(this).select('rect').attr('width');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        marker.setAttributeNS(null, 'class', 'tooltip-marker');
        marker.setAttributeNS(null, 'x', width / 2 + 3);
        marker.setAttributeNS(null, 'y', -3);
        marker.textContent = '?';
        this.appendChild(marker);

        tippy(this, {
          content: detail,
          trigger: "mouseenter focus click",
          interactive: true
        });
      }
    });
};

// Main

let facts = {
  arrestingPerson: null, // 'citizen' | 'police'
  warrant: null, // true | false
  offenceCategory: null // 'summary' | 'hybrid' | 'indictableShort' | 'indictableLong' | 's469' | 's553'
};

const svg = d3.select('svg');
const canvas = svg.append('g');
svg.call(d3.zoom().on("zoom", () => canvas.attr('transform', d3.event.transform)));

render(createGraph(nodes, edges, facts));

d3.selectAll('input').on('click', function () {
  const form = document.getElementById('facts');

  facts = {
    arrestingPerson: this.name === 'arrestingPerson' && this.value === facts.arrestingPerson
      ? null
      : (form.elements['arrestingPerson'].value || null),
    warrant: this.name === 'warrant' && booleanFromString(this.value) === facts.warrant
      ? null
      : booleanFromString(form.elements['warrant'].value),
    offenceCategory: this.name === 'offenceCategory' && this.value === facts.offenceCategory
      ? null
      : (form.elements['offenceCategory'].value || null)
  };

  if (facts.arrestingPerson === null) document.querySelectorAll('input[name="arrestingPerson"]').forEach(n => n.checked = false);
  if (facts.warrant === null) document.querySelectorAll('input[name="warrant"]').forEach(n => n.checked = false);
  if (facts.offenceCategory === null) document.querySelectorAll('input[name="offenceCategory"]').forEach(n => n.checked = false);

  render(createGraph(nodes, edges, facts));
});
