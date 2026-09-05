/* ============================================================
   CONTENT.JS
   This is the only file you should need to edit to make this
   website yours. Everything the site displays — names, dates,
   messages, audio, letters, secrets — lives here.

   Anything wrapped in [BRACKETS] is a placeholder. Replace the
   whole bracketed string, including the brackets.
   ============================================================ */

window.CONTENT = {

  meta: {
    pageTitle: "between here and there.",
  },

  relationship: {
    personA: {
      name: "[YOUR NAME]",
      city: "[YOUR CITY]",
      country: "[YOUR COUNTRY]",
      // Standard IANA timezone, e.g. "Asia/Kolkata"
      timezone: "[YOUR TIMEZONE]",
      // approximate coordinates, used only for the map
      lat: 0,
      lon: 0,
    },
    personB: {
      name: "[HIS NAME]",
      city: "[HIS CITY]",
      country: "[HIS COUNTRY]",
      timezone: "[HIS TIMEZONE]",
      lat: 0,
      lon: 0,
    },
    // ISO date, used to calculate "days since"
    relationshipStart: "2025-01-01",
    metDate: "[DATE YOU MET]",
  },

  // ----------------------------------------------------------
  // CHAPTER 2 — HOW WE GOT HERE
  // ----------------------------------------------------------
  timeline: [
    {
      id: "t1",
      date: "[DATE]",
      type: "FIRST MESSAGE",
      title: "[FIRST MESSAGE]",
      short: "[One line on how it started.]",
      long: "[Write the fuller story here. What did you say. What did they say back. Why it mattered.]",
      quote: null,
    },
    {
      id: "t2",
      date: "[DATE]",
      type: "FIRST CALL",
      title: "[FIRST CALL]",
      short: "[One line.]",
      long: "[Fuller story.]",
      quote: null,
    },
    {
      id: "t3",
      date: "[DATE]",
      type: "FIRST VOICE NOTE",
      title: "[FIRST VOICE NOTE]",
      short: "[One line.]",
      long: "[Fuller story.]",
      quote: null,
    },
    {
      id: "t4",
      date: "[DATE]",
      type: "FIRST INSIDE JOKE",
      title: "[FIRST INSIDE JOKE]",
      short: "[One line.]",
      long: "[Fuller story.]",
      quote: null,
    },
    {
      id: "t5",
      date: "[DATE]",
      type: "FIRST ARGUMENT",
      title: "[FIRST ARGUMENT]",
      short: "[One line, kept honest.]",
      long: "[What it was actually about. What you learned.]",
      quote: null,
    },
    {
      id: "t6",
      date: "[DATE]",
      type: "FIRST “I LOVE YOU”",
      title: "[FIRST I LOVE YOU]",
      short: "[One line.]",
      long: "[Fuller story.]",
      quote: "[A short exact line, if you want one.]",
    },
    {
      id: "t7",
      date: "[DATE]",
      type: "HARDEST NIGHT",
      title: "[HARDEST NIGHT]",
      short: "[One line. Kept honest, not dramatic.]",
      long: "[Fuller story.]",
      quote: null,
    },
    {
      id: "t8",
      date: "[DATE]",
      type: "FUNNIEST NIGHT",
      title: "[FUNNIEST NIGHT]",
      short: "[One line.]",
      long: "[Fuller story.]",
      quote: null,
    },
    {
      id: "t9",
      date: "TODAY",
      type: "CURRENT DAY",
      title: "[WHERE WE ARE NOW]",
      short: "[One line about right now.]",
      long: "[Fuller story.]",
      quote: null,
    },
  ],

  // ----------------------------------------------------------
  // CHAPTER 3 — THE THINGS THAT AREN'T PHOTOGRAPHS
  // types: MESSAGE, SCREENSHOT, VOICE, SONG, QUOTE, DATE, MEMORY, CONFESSION, JOKE, PLACE
  // ----------------------------------------------------------
  artifacts: [
    { id: "a1", type: "MESSAGE", title: "[YOUR MESSAGE HERE]", date: "[DATE]", body: "[Paste or describe the message.]" },
    { id: "a2", type: "SCREENSHOT", title: "[UPLOAD SCREENSHOT]", date: "[DATE]", image: null, body: "[What's happening in it.]" },
    { id: "a3", type: "VOICE", title: "[VOICE NOTE TITLE]", date: "[DATE]", audio: null, body: "[What it's about, or why you kept it.]" },
    { id: "a4", type: "SONG", title: "[YOUR SONG]", date: "[DATE]", spotify: null, body: "[Why this one.]" },
    { id: "a5", type: "QUOTE", title: "[SOMETHING THEY SAID]", date: "[DATE]", body: "[The line, in your own memory of it.]" },
    { id: "a6", type: "DATE", title: "[A DATE THAT MATTERS]", date: "[DATE]", body: "[Why this date, specifically.]" },
    { id: "a7", type: "MEMORY", title: "[YOUR MEMORY HERE]", date: "[DATE]", body: "[Describe it.]" },
    { id: "a8", type: "CONFESSION", title: "[SOMETHING YOU ADMITTED]", date: "[DATE]", body: "[What it was.]" },
    { id: "a9", type: "JOKE", title: "[AN INSIDE JOKE]", date: "[DATE]", body: "[Explain it badly, on purpose.]" },
    { id: "a10", type: "PLACE", title: "[A PLACE THAT MEANS SOMETHING]", date: "[DATE]", body: "[Why, even though neither of you has been there together.]" },
  ],

  // ----------------------------------------------------------
  // CHAPTER 4 — THE SOUND OF US
  // audio: path to an mp3/m4a/wav in /audio, or null for placeholder
  // spotify: a Spotify track/playlist URI or share link, or null
  // ----------------------------------------------------------
  sound: {
    categories: [
      {
        id: "ours",
        label: "SONGS THAT ARE OURS",
        items: [
          { id: "s1", title: "[SONG TITLE]", note: "[Why it's ours.]", spotify: null, audio: null, duration: null },
          { id: "s2", title: "[SONG TITLE]", note: "[Why it's ours.]", spotify: null, audio: null, duration: null },
        ],
      },
      {
        id: "missme",
        label: "WHEN YOU MISS ME",
        items: [
          { id: "s3", title: "[VOICE NOTE TITLE]", note: "[One line of context.]", audio: null, duration: null },
        ],
      },
      {
        id: "cantsleep",
        label: "WHEN YOU CAN'T SLEEP",
        items: [
          { id: "s4", title: "[VOICE NOTE TITLE]", note: "[One line of context.]", audio: null, duration: null },
        ],
      },
      {
        id: "badday",
        label: "WHEN YOU'RE HAVING A BAD DAY",
        items: [
          { id: "s5", title: "[VOICE NOTE TITLE]", note: "[One line of context.]", audio: null, duration: null },
        ],
      },
      {
        id: "justbecause",
        label: "JUST BECAUSE",
        items: [
          { id: "s6", title: "[VOICE NOTE TITLE]", note: "[One line of context.]", audio: null, duration: null },
        ],
      },
    ],
    // very quiet looping bed for the site itself. Leave null for silence.
    ambient: null,
  },

  // ----------------------------------------------------------
  // CHAPTER 5 — THINGS I KNOW ABOUT YOU
  // ----------------------------------------------------------
  knowledgeWall: [
    { front: "your favourite ___", back: "[ANSWER]" },
    { front: "the thing that always makes you laugh", back: "[ANSWER]" },
    { front: "your weirdest habit", back: "[ANSWER]" },
    { front: "something you pretend not to care about", back: "[ANSWER]" },
    { front: "something you care about deeply", back: "[ANSWER]" },
    { front: "your comfort thing", back: "[ANSWER]" },
    { front: "the thing you always say", back: "[ANSWER]" },
    { front: "your most predictable behaviour", back: "[ANSWER]" },
    { front: "something you don't know I notice", back: "[ANSWER]" },
    { front: "something I hope never changes", back: "[ANSWER]" },
  ],

  // ----------------------------------------------------------
  // CHAPTER 6 — THINGS YOU DON'T KNOW ABOUT ME
  // types: CONFESSION, EMBARRASSING, RANDOM, SERIOUS, FUNNY, DREAM, FEAR, HOPE, SECRET
  // ----------------------------------------------------------
  sealedCards: [
    { id: "c1", type: "CONFESSION", body: "[Write it here. Sealed until they click it open.]" },
    { id: "c2", type: "EMBARRASSING", body: "[Write it here.]" },
    { id: "c3", type: "FEAR", body: "[Write it here.]" },
    { id: "c4", type: "HOPE", body: "[Write it here.]" },
    { id: "c5", type: "DREAM", body: "[Write it here.]" },
    { id: "c6", type: "FUNNY", body: "[Write it here.]" },
    { id: "c7", type: "RANDOM", body: "[Write it here.]" },
    { id: "c8", type: "SERIOUS", body: "[Write it here.]" },
  ],

  // ----------------------------------------------------------
  // CHAPTER 7 — OPEN WHEN
  // lockedUntil: ISO date string, or null to leave unlocked
  // ----------------------------------------------------------
  openWhen: [
    { id: "ow1", label: "OPEN WHEN YOU MISS ME", body: "[Letter text.]", audio: null, lockedUntil: null },
    { id: "ow2", label: "OPEN WHEN YOU CAN'T SLEEP", body: "[Letter text.]", audio: null, lockedUntil: null },
    { id: "ow3", label: "OPEN WHEN YOU'RE ANGRY WITH ME", body: "[Letter text.]", audio: null, lockedUntil: null },
    { id: "ow4", label: "OPEN WHEN YOU'RE HAVING A TERRIBLE DAY", body: "[Letter text.]", audio: null, lockedUntil: null },
    { id: "ow5", label: "OPEN WHEN YOU'RE PROUD OF YOURSELF", body: "[Letter text.]", audio: null, lockedUntil: null },
    { id: "ow6", label: "OPEN WHEN YOU FEEL ALONE", body: "[Letter text.]", audio: null, lockedUntil: null },
    { id: "ow7", label: "OPEN WHEN YOU NEED TO LAUGH", body: "[Letter text.]", audio: null, lockedUntil: null },
    { id: "ow8", label: "OPEN WHEN YOU NEED MOTIVATION", body: "[Letter text.]", audio: null, lockedUntil: null },
    { id: "ow9", label: "OPEN WHEN YOU WANT TO HEAR MY VOICE", body: "[Letter text.]", audio: null, lockedUntil: null },
    { id: "ow10", label: "OPEN WHEN YOU WONDER IF I STILL LOVE YOU", body: "[Letter text.]", audio: null, lockedUntil: null },
    { id: "ow11", label: "OPEN WHEN WE FINALLY MEET", body: "[Letter text, saved for that day.]", audio: null, lockedUntil: null },
  ],

  // ----------------------------------------------------------
  // CHAPTER 8 — OUR PRIVATE LANGUAGE
  // ----------------------------------------------------------
  privateLanguage: [
    { word: "[WORD OR PHRASE]", others: "[what a stranger would assume it means]", actually: "[what it actually means to you two]" },
    { word: "[WORD OR PHRASE]", others: "[assumption]", actually: "[real meaning]" },
    { word: "[WORD OR PHRASE]", others: "[assumption]", actually: "[real meaning]" },
  ],

  // ----------------------------------------------------------
  // CHAPTER 9 — THE LITTLE THINGS (chaotic wall)
  // ----------------------------------------------------------
  littleThings: [
    { id: "l1", kind: "note", text: "[a tiny note or observation]" },
    { id: "l2", kind: "note", text: "[a random memory]" },
    { id: "l3", kind: "note", text: "[a phrase one of you says too much]" },
    { id: "l4", kind: "note", text: "[a date that means something]" },
    { id: "l5", kind: "note", text: "[something dumb you argued about]" },
    { id: "l6", kind: "note", text: "[a nickname and where it came from]" },
    { id: "l7", kind: "note", text: "[a song lyric you both misheard the same way]" },
    { id: "l8", kind: "note", text: "[something they do that you'd never tell them you noticed — until now]" },
  ],

  // ----------------------------------------------------------
  // CHAPTER 10 — IF YOU WERE HERE
  // ----------------------------------------------------------
  ifYouWereHere: [
    { id: "i1", label: "IF YOU WERE HERE RIGHT NOW", text: "[A short, specific, imagined scene.]" },
    { id: "i2", label: "IF YOU WERE HERE TOMORROW", text: "[Scene.]" },
    { id: "i3", label: "IF YOU WERE SITTING NEXT TO ME", text: "[Scene.]" },
    { id: "i4", label: "IF WE HAD ONE PERFECT DAY", text: "[Scene.]" },
    { id: "i5", label: "IF WE COULD GO ANYWHERE", text: "[Scene.]" },
    { id: "i6", label: "IF YOU WERE HAVING A BAD DAY", text: "[Scene.]" },
  ],

  // ----------------------------------------------------------
  // CHAPTER 11 — THE FUTURE
  // ----------------------------------------------------------
  future: [
    { id: "f1", text: "meet for the first time", done: false },
    { id: "f2", text: "take our first photograph", done: false },
    { id: "f3", text: "have our first ordinary day together", done: false },
    { id: "f4", text: "travel somewhere together", done: false },
    { id: "f5", text: "watch a sunrise", done: false },
    { id: "f6", text: "get lost somewhere", done: false },
    { id: "f7", text: "eat something neither of us has tried", done: false },
    { id: "f8", text: "do something completely stupid", done: false },
    { id: "f9", text: "recreate a favourite memory", done: false },
    { id: "f10", text: "make a memory that becomes our favourite", done: false },
  ],

  // ----------------------------------------------------------
  // CHAPTER 12 — THE FIRST PHOTOGRAPH
  // state: "EMPTY" | "RESERVED" | "FILLED"
  // when you have the real photo, set state to "FILLED" and image to its path
  // ----------------------------------------------------------
  firstPhotograph: {
    state: "RESERVED",
    image: null,
    caption: "[Caption for the real day, when it comes.]",
  },

  // ----------------------------------------------------------
  // CHAPTER 13 — THE FIRST MEETING
  // ----------------------------------------------------------
  firstMeeting: {
    location: "[WHERE YOU IMAGINE MEETING]",
    time: "[TIME OF DAY]",
    weather: "[WEATHER]",
    sounds: "[WHAT YOU IMAGINE HEARING]",
    imThinking: "[What you're probably thinking in that moment.]",
    imProbablyDoing: "[What you're probably doing.]",
    theyreProbablyDoing: "[What they're probably doing.]",
    whatHappensNext: "[What happens next, in your imagination.]",
  },

  // ----------------------------------------------------------
  // THE LOVE LETTER
  // ----------------------------------------------------------
  letter: {
    title: "[LETTER TITLE]",
    date: "[DATE]",
    body: "[Write the full letter here. It can be as long as you want — the page is built to hold it.]",
    signature: "[YOUR NAME]",
    finalLine: "[One last line, after the letter.]",
  },

  // ----------------------------------------------------------
  // FINAL VOICE NOTE
  // ----------------------------------------------------------
  finalVoiceNote: {
    audio: null,
    duration: null,
  },

  // ----------------------------------------------------------
  // SECRETS — 12 discoverable easter eggs.
  // Each secret has an id (referenced in the JS trigger for it)
  // and content that unlocks when found.
  // ----------------------------------------------------------
  secrets: {
    total: 12,
    unlocks: [
      { at: 3, label: "an extra voice note", content: "[Unlocked content for 3 secrets.]" },
      { at: 6, label: "an unreleased letter", content: "[Unlocked content for 6 secrets.]" },
      { at: 9, label: "a private gallery", content: "[Unlocked content for 9 secrets.]" },
      { at: 12, label: "the real ending", content: "[Unlocked content for 12 secrets.]" },
    ],
  },

  // ----------------------------------------------------------
  // THE RELATIONSHIP GAME
  // ----------------------------------------------------------
  quiz: [
    {
      q: "[A question only they'd know the answer to.]",
      options: ["[Answer A]", "[Answer B]", "[Answer C]"],
      correct: 0,
      explanation: "[Why that's the answer.]",
    },
    {
      q: "[Another question.]",
      options: ["[Answer A]", "[Answer B]", "[Answer C]"],
      correct: 1,
      explanation: "[Why.]",
    },
    {
      q: "[Another question.]",
      options: ["[Answer A]", "[Answer B]"],
      correct: 0,
      explanation: "[Why.]",
    },
  ],

  // ----------------------------------------------------------
  // RANDOM US GENERATOR
  // ----------------------------------------------------------
  prompts: [
    "Send a voice note without planning what you're going to say.",
    "Choose a place neither of us has visited and pretend we're there for five minutes.",
    "Tell me the first thing you noticed about me.",
    "Both pick a song. Neither of us explains why until the other has listened.",
    "Describe today using only the weather.",
    "Ask me the question you've been putting off asking.",
    "Tell me a memory from before we met, in as much detail as you can.",
    "We both write down what we think the other is doing right now. Compare.",
  ],

  // ----------------------------------------------------------
  // TIME CAPSULES
  // unlockDate: ISO date string
  // ----------------------------------------------------------
  timeCapsules: [
    { id: "tc1", label: "OPEN IN ONE MONTH", message: "[Message.]", unlockDate: "2099-01-01" },
    { id: "tc2", label: "OPEN IN SIX MONTHS", message: "[Message.]", unlockDate: "2099-01-01" },
    { id: "tc3", label: "OPEN ON OUR NEXT ANNIVERSARY", message: "[Message.]", unlockDate: "2099-01-01" },
  ],

  // ----------------------------------------------------------
  // TODAY — shown once per day. Add as many as you like; the
  // site picks a deterministic one based on the day of the year
  // so it's stable if they refresh, and rotates daily.
  // ----------------------------------------------------------
  daily: [
    { type: "question", text: "[A small question to leave for today.]" },
    { type: "memory", text: "[A memory to resurface today.]" },
    { type: "note", text: "[Something small for today.]" },
  ],

};
