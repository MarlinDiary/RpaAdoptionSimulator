export const rounds = [
  {
    id: 1,
    title: "Round 1",
    question: "Your clients use many different accounting systems, and RPA integration is difficult. Do you want to hire an external consultant to start RPA now?",
    choices: [
      {
        id: "yes",
        label: "YES",
        points: 2,
        delay: "Skip next round (Supply lag)",
        explanation: "You face technical integration delays and must skip this round.",
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
    title: "Round 2",
    question: "A vendor offers a 3-month free RPA trial. Do you want to join the trial?",
    choices: [
      {
        id: "yes",
        label: "YES",
        points: 2,
        delay: "None",
        explanation: "Builds experience, reduces technical lag",
        skipNextRound: false
      },
      {
        id: "no",
        label: "NO",
        points: -1,
        delay: "None",
        explanation: "Missed opportunity, technology gap remains",
        skipNextRound: false
      }
    ]
  },
  {
    id: 3,
    title: "Round 3",
    question: "The government released a new data standard (SAF-T) but it's not yet mandatory. Do you want to upgrade your system early?",
    choices: [
      {
        id: "yes",
        label: "YES",
        points: 2,
        delay: "Skip next round (Regulation Lag)",
        explanation: "Your firm is updating systems to meet new audit standards. You must pause for this round while implementation is in progress.",
        skipNextRound: true
      },
      {
        id: "no",
        label: "NO",
        points: 0,
        delay: "None",
        explanation: "Wait for clarity, no progress",
        skipNextRound: false
      }
    ]
  },
  {
    id: 4,
    title: "Round 4",
    question: "Other firms show their RPA success and time savings. Do you want to make your own RPA progress public?",
    choices: [
      {
        id: "yes",
        label: "YES",
        points: 2,
        delay: "None",
        explanation: "Improves transparency and client trust",
        skipNextRound: false
      },
      {
        id: "no",
        label: "NO",
        points: 0,
        delay: "None",
        explanation: "Low visibility, demand lag continues",
        skipNextRound: false
      }
    ]
  },
  {
    id: 5,
    title: "Round 5",
    question: "A new RPA plan can increase efficiency by 20%, but it's expensive. Do you want to pay for it?",
    choices: [
      {
        id: "yes",
        label: "YES",
        points: 2,
        delay: "Skip next round (Demand Lag)",
        explanation: "High RPA investment costs have slowed your short-term progress.",
        skipNextRound: true
      },
      {
        id: "no",
        label: "NO",
        points: 0,
        delay: "None",
        explanation: "Save cost, risk falling behind",
        skipNextRound: false
      }
    ]
  },
  {
    id: 6,
    title: "Round 6",
    question: "Your firm is stable and profitable. Would you still invest in RPA now to drive future innovation?",
    choices: [
      {
        id: "yes",
        label: "YES",
        points: 3,
        delay: "None",
        explanation: "Shows vision and proactive innovation",
        skipNextRound: false
      },
      {
        id: "no",
        label: "NO",
        points: 0,
        delay: "None",
        explanation: "Safe choice but loses future advantage",
        skipNextRound: false
      }
    ]
  }
];
