/*
 * Nocturne question deck.
 * Bundled as a JS file (not JSON) so it loads inside the Android WebView
 * without fetch()/file:// issues. {player} is replaced with another random player.
 */
window.NOCTURNE_LEVELS = [
  { id: "warmup",  name: "Warm-up", desc: "Silly and safe, good for starting out" },
  { id: "flirty",  name: "Flirty",  desc: "Crushes, compliments and blushing" },
  { id: "spicy",   name: "Spicy",   desc: "Bolder, for friends who know each other well" },
  { id: "couples", name: "Couples", desc: "For partners playing together" }
];

window.NOCTURNE_DECK = {
  warmup: {
    truth: [
      "What's the most embarrassing thing you've done in front of a crush?",
      "What's a habit of yours that nobody here knows about?",
      "Who in this room would survive longest in a zombie movie?",
      "What's the last thing you searched on your phone?",
      "What's the worst gift you've ever received?",
      "Which app do you spend way too much time on?",
      "What's the most childish thing you still do?",
      "What's a lie you told that got completely out of hand?",
      "What's your most useless talent?",
      "If you could swap lives with {player} for a day, what would you do first?",
      "What's the weirdest food combination you secretly love?",
      "What's the longest you've gone without showering?",
      "What's a song you'd be embarrassed for people to know you love?",
      "What's the pettiest reason you've stopped talking to someone?",
      "What's the strangest dream you can remember?"
    ],
    dare: [
      "Do your best impression of {player} until someone guesses who it is.",
      "Speak in an accent of the group's choice until your next turn.",
      "Show the group the last photo in your camera roll.",
      "Let {player} post a harmless status on your social media.",
      "Do 10 squats while singing the national anthem.",
      "Talk without closing your mouth for the next 30 seconds.",
      "Let the group choose your phone wallpaper for the rest of the night.",
      "Try to lick your elbow for 15 seconds.",
      "Do a dramatic reading of the last text you received.",
      "Dance with no music for 20 seconds.",
      "Let {player} give you a new hairstyle using only their hands.",
      "Act like a cat until your next turn whenever someone says your name.",
      "Tell a joke. If nobody laughs, take another dare.",
      "Hold a plank until someone finishes counting to 30.",
      "Call or text a friend and tell them a fun fact about penguins."
    ]
  },

  flirty: {
    truth: [
      "Who in this room has the best smile?",
      "What's the cheesiest pickup line that would actually work on you?",
      "What's the first thing you notice about someone you find attractive?",
      "Have you ever had a crush on a friend's partner? No names needed.",
      "What's your idea of a perfect first date?",
      "Who was your first celebrity crush?",
      "What's the most romantic thing someone has done for you?",
      "Rate your flirting skills from 1 to 10 — then let {player} rate them.",
      "What's a small thing someone can do that instantly makes you blush?",
      "Have you ever pretended to like something just to impress a crush?",
      "Who here would you trust to plan a date for you?",
      "What's the boldest move you've made on someone?",
      "What's your biggest turn-off on a date?",
      "Have you ever slid into someone's DMs? How did it go?",
      "Which person here would you pick as a fake date to a wedding?"
    ],
    dare: [
      "Give {player} a compliment that makes them blush.",
      "Use your best pickup line on {player}.",
      "Send a flirty emoji to the last person you texted (you can explain later).",
      "Wink at everyone in the room one by one, keeping a straight face.",
      "Serenade {player} with one line of a love song.",
      "Hold eye contact with {player} for 20 seconds without laughing.",
      "Describe your type using only three words.",
      "Let {player} write a dating profile bio for you — read it out loud.",
      "Slow dance with {player} for 20 seconds.",
      "Whisper something sweet into {player}'s ear.",
      "Strike your best 'model' pose and hold it for 10 seconds.",
      "Give {player} a hand kiss like royalty.",
      "Tell {player} what you first thought when you met them.",
      "Flirt with an object in the room for 20 seconds.",
      "Let the group pick someone for you to give a 10-second hug."
    ]
  },

  spicy: {
    truth: [
      "What's the most daring place you've kissed someone?",
      "What's a fantasy you've never told anyone?",
      "Who in this room do you think is the best kisser?",
      "What's the wildest thing on your bucket list?",
      "Have you ever been caught in an awkward romantic moment?",
      "What's your biggest turn-on?",
      "What's the most spontaneous thing you've done for love or lust?",
      "Have you ever kissed someone in this room?",
      "What's the shortest time between meeting someone and kissing them?",
      "What's the naughtiest text you've ever sent?",
      "Which song would be on your 'mood' playlist?",
      "What's something that's guaranteed to get your attention?",
      "Have you ever had a secret relationship?",
      "What's the most attractive thing about {player}?",
      "What's a romantic risk you regret not taking?"
    ],
    dare: [
      "Give {player} a 30-second shoulder massage.",
      "Whisper something bold to {player}.",
      "Do your most seductive dance for 20 seconds.",
      "Let {player} choose someone for you to kiss on the cheek.",
      "Describe your ideal kiss in detail, slowly.",
      "Sit on {player}'s lap until your next turn (if they're okay with it).",
      "Remove one accessory or piece of jewellery and give it to {player} until the game ends.",
      "Read your last text out loud in your most sultry voice.",
      "Let {player} draw a tiny heart anywhere on your arm.",
      "Recreate a famous movie kiss scene — with your hand.",
      "Give {player} a lingering hug for 15 seconds.",
      "Let the group give you a new nickname, and keep it all night.",
      "Show the group the most flirty message in your chats (blur names).",
      "Feed {player} a snack without using your hands.",
      "Trace a word on {player}'s back with your finger — they have to guess it."
    ]
  },

  couples: {
    truth: [
      "What was your very first impression of your partner?",
      "What's your favourite memory together so far?",
      "What's one thing your partner does that drives you wild — in a good way?",
      "When did you first realise you liked your partner?",
      "What's something you've always wanted to try together?",
      "What's your favourite thing about your partner's body?",
      "What's the most romantic date you've had together?",
      "What's a little habit of your partner's you secretly love?",
      "If you could relive one day together, which would it be?",
      "What's something you've never told your partner but want to?",
      "What song reminds you of your partner?",
      "What's your partner's best outfit?",
      "What's one way your partner could surprise you this week?",
      "What do you find most attractive about how your partner treats others?",
      "What's the first thing you'd do together on a trip with no plans?"
    ],
    dare: [
      "Kiss your partner for 10 seconds.",
      "Give your partner a 1-minute massage — they pick where.",
      "Slow dance with your partner to a song they choose.",
      "Whisper your favourite thing about your partner in their ear.",
      "Recreate your first kiss.",
      "Feed your partner something sweet.",
      "Hold hands with your partner until your next turn.",
      "Write a 4-line love poem for your partner and read it out.",
      "Give your partner three kisses — on three different spots of their choice.",
      "Look into your partner's eyes for 30 seconds without speaking.",
      "Plan your next date out loud in under 30 seconds.",
      "Let your partner choose a dare for you.",
      "Tell your partner what you'd do on a perfect night in.",
      "Draw a heart on your partner's hand and sign it.",
      "Give your partner a forehead kiss and a real compliment."
    ]
  }
};

window.NOCTURNE_PENALTIES = [
  "Take a sip of your drink (water counts!).",
  "Do 10 jumping jacks.",
  "Let the group choose your next dare.",
  "Answer the next Truth anyway — no skipping.",
  "Swap seats with {player}.",
  "Speak only in questions until your next turn.",
  "Give everyone a high five.",
  "Sing the chorus of any song.",
  "Let {player} pick a silly pose — hold it for 15 seconds.",
  "Tell the group an embarrassing story."
];
