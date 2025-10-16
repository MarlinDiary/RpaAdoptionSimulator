const rounds = [
  {
    id: 1,
    title: "Round 1 - Complexity (Supply Lag)",
    question: "Your clients use many different accounting systems, and RPA integration is difficult. Do you want to hire an external consultant to start RPA now?",
    choices: [
      {
        id: "yes",
        label: "YES",
        points: 2,
        delay: "Skip next round (integration delay)",
        explanation: "Active choice but faces technical complexity",
        skipNextRound: true
      },
      {
        id: "no",
        label: "NO",
        points: 0,
        delay: "None",
        explanation: "Stay cautious, no progress made",
        skipNextRound: false
      }
    ]
  },
  {
    id: 2,
    title: "Round 2 - Trialability (Supply Lag)",
    question: "A vendor offers a 3-month free RPA trial. Do you want to join the trial?",
    choices: [
      {
        id: "yes",
        label: "YES",
        points: 2,
        delay: "None",
        explanation: "Builds experience, reduces technical lag"
      },
      {
        id: "no",
        label: "NO",
        points: -1,
        delay: "None",
        explanation: "Missed opportunity, technology gap remains"
      }
    ]
  }
];

module.exports = { rounds };
