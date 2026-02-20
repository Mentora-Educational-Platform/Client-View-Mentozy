export interface BotQA {
    id: string;
    question: string;
    answer: string;
    keywords: string[];
}

export const BOT_RESPONSES: BotQA[] = [
    // PLATFORM OVERVIEW & TEAM
    {
        id: 'team-1',
        question: "Who is founder?",
        answer: "Harshita Bhaskaruni",
        keywords: ["founder", "ceo", "creator", "owner", "harshita", "bhaskaruni"]
    },
    {
        id: 'overview-1',
        question: "What is Mentozy?",
        answer: "Mentozy is a peer-driven learning platform where students and mentors connect for skill-based education.",
        keywords: ["what is mentozy", "about mentozy", "explain mentozy", "platform"]
    },
    {
        id: 'overview-2',
        question: "How does Mentozy work?",
        answer: "Students browse mentors, book sessions, and learn live. Mentors teach and earn.",
        keywords: ["how does it work", "how mentozy works", "process", "working"]
    },
    {
        id: 'overview-3',
        question: "Who can join Mentozy?",
        answer: "Students and individuals who pass the eligibility test to become mentors.",
        keywords: ["who can join", "eligibility", "join mentozy"]
    },
    {
        id: 'overview-4',
        question: "Is Mentozy free?",
        answer: "Browsing is free. Sessions and subscriptions may include fees.",
        keywords: ["is it free", "cost", "pricing", "free", "charges"]
    },
    {
        id: 'overview-5',
        question: "What makes Mentozy different?",
        answer: "Open teaching eligibility, student-first design, and accessible learning.",
        keywords: ["difference", "unique", "why mentozy", "special"]
    },
    {
        id: 'overview-6',
        question: "Is Mentozy online?",
        answer: "Yes. It is fully digital and remote.",
        keywords: ["online", "remote", "physical", "offline"]
    },
    {
        id: 'overview-7',
        question: "Can I teach without a degree?",
        answer: "Yes. Passing the eligibility test is sufficient.",
        keywords: ["teach without degree", "no degree", "qualification", "degree required"]
    },
    {
        id: 'overview-8',
        question: "What subjects are available?",
        answer: "Academic, technical, creative, and skill-based subjects.",
        keywords: ["subjects", "courses", "topics", "what can i learn"]
    },
    {
        id: 'overview-9',
        question: "Is Mentozy global?",
        answer: "Yes.",
        keywords: ["global", "international", "countries", "available in"]
    },
    {
        id: 'overview-10',
        question: "Do you provide certificates?",
        answer: "Currently under development.",
        keywords: ["certificates", "certification", "diploma"]
    },
    {
        id: 'overview-11',
        question: "Is Mentozy mobile-friendly?",
        answer: "Yes.",
        keywords: ["mobile", "phone", "tablet", "responsive"]
    },
    {
        id: 'overview-12',
        question: "Can organizations join?",
        answer: "Yes.",
        keywords: ["organizations", "companies", "partners", "business"]
    },
    {
        id: 'overview-13',
        question: "Is there an app?",
        answer: "Web platform currently. App planned.",
        keywords: ["app", "application", "ios", "android", "mobile app"]
    },
    {
        id: 'overview-14',
        question: "How do I contact support?",
        answer: "Email hello@mentozy.app.",
        keywords: ["support", "contact", "help", "email", "customer service"]
    },
    {
        id: 'overview-15',
        question: "Is Mentozy safe?",
        answer: "Yes, with verification systems.",
        keywords: ["safe", "security", "safety", "trust"]
    },
    {
        id: 'overview-16',
        question: "Do you verify mentors?",
        answer: "Yes, through eligibility tests.",
        keywords: ["verify mentors", "mentor verification", "checked"]
    },
    {
        id: 'overview-17',
        question: "Can students rate mentors?",
        answer: "Yes.",
        keywords: ["rate", "rating", "review", "feedback"]
    },
    {
        id: 'overview-18',
        question: "Is there a refund policy?",
        answer: "For refund queries contact hello@mentozy.app.",
        keywords: ["refund", "money back", "return"]
    },
    {
        id: 'overview-19',
        question: "Is Mentozy recorded sessions based?",
        answer: "Depends on mentor preference.",
        keywords: ["recorded", "live", "recordings"]
    },
    {
        id: 'overview-20',
        question: "What is Mentozy’s mission?",
        answer: "To make education practical, accessible, and empowering.",
        keywords: ["mission", "vision", "goal", "aim"]
    },

    // STUDENT QUESTIONS
    {
        id: 'student-1',
        question: "How do I sign up?",
        answer: "Create an account and complete your profile.",
        keywords: ["sign up", "register", "create account", "join as student"]
    },
    {
        id: 'student-2',
        question: "How do I book a session?",
        answer: "Select a mentor and choose an available slot.",
        keywords: ["book", "booking", "schedule", "appointment"]
    },
    {
        id: 'student-3',
        question: "Can I cancel a session?",
        answer: "Yes, according to cancellation policy.",
        keywords: ["cancel", "cancellation", "remove booking"]
    },
    {
        id: 'student-4',
        question: "How do I pay?",
        answer: "Through integrated secure payment gateway.",
        keywords: ["pay", "payment", "method", "card", "upi"]
    },
    {
        id: 'student-5',
        question: "Do you offer subscriptions?",
        answer: "Yes.",
        keywords: ["subscription", "plans", "monthly", "yearly"]
    },
    {
        id: 'student-6',
        question: "Can I switch mentors?",
        answer: "Yes.",
        keywords: ["switch mentor", "change mentor", "another mentor"]
    },
    {
        id: 'student-7',
        question: "Are sessions live?",
        answer: "Yes.",
        keywords: ["live sessions", "real time"]
    },
    {
        id: 'student-8',
        question: "Can I message mentors?",
        answer: "Yes.",
        keywords: ["message", "chat", "contact mentor"]
    },
    {
        id: 'student-9',
        question: "How do I track my learning?",
        answer: "Dashboard progress tracking.",
        keywords: ["track", "progress", "dashboard", "stats"]
    },
    {
        id: 'student-10',
        question: "Do I get materials?",
        answer: "If mentor provides them.",
        keywords: ["materials", "notes", "resources", "pdf"]
    },
    {
        id: 'student-11',
        question: "Can I review mentors?",
        answer: "Yes.",
        keywords: ["review mentor", "give feedback"]
    },
    {
        id: 'student-12',
        question: "Is group learning available?",
        answer: "Yes, based on mentor setup.",
        keywords: ["group", "batch", "class"]
    },
    {
        id: 'student-13',
        question: "How long are sessions?",
        answer: "Depends on mentor settings.",
        keywords: ["duration", "how long", "time"]
    },
    {
        id: 'student-14',
        question: "Can I request a subject?",
        answer: "Yes.",
        keywords: ["request subject", "topic request"]
    },
    {
        id: 'student-15',
        question: "Is there a trial session?",
        answer: "Depends on mentor.",
        keywords: ["trial", "demo", "free session"]
    },
    {
        id: 'student-16',
        question: "What if mentor misses session?",
        answer: "Contact hello@mentozy.app.",
        keywords: ["mentor missed", "absent", "no show"]
    },
    {
        id: 'student-17',
        question: "Can minors join?",
        answer: "With guardian consent.",
        keywords: ["minor", "under 18", "child", "kid"]
    },
    {
        id: 'student-18',
        question: "Do you offer discounts?",
        answer: "Occasionally.",
        keywords: ["discount", "coupon", "offer", "promo"]
    },
    {
        id: 'student-19',
        question: "Are sessions recorded?",
        answer: "If enabled.",
        keywords: ["session recorded", "watch later"]
    },
    {
        id: 'student-20',
        question: "Can I reschedule?",
        answer: "Yes within policy window.",
        keywords: ["reschedule", "change time", "move session"]
    },
    {
        id: 'student-21',
        question: "Is attendance mandatory?",
        answer: "Yes for booked sessions.",
        keywords: ["attendance", "mandatory", "attend"]
    },
    {
        id: 'student-22',
        question: "How do I upgrade membership?",
        answer: "Through account settings.",
        keywords: ["upgrade", "membership", "premium"]
    },
    {
        id: 'student-23',
        question: "Can I learn multiple subjects?",
        answer: "Yes.",
        keywords: ["multiple subjects", "many courses"]
    },
    {
        id: 'student-24',
        question: "Is payment refundable?",
        answer: "Refer refund policy via hello@mentozy.app.",
        keywords: ["refund payment", "money back"]
    },
    {
        id: 'student-25',
        question: "How secure are payments?",
        answer: "Encrypted and secure.",
        keywords: ["payment security", "safe payment"]
    },
    {
        id: 'student-26',
        question: "Do I get reminders?",
        answer: "Yes.",
        keywords: ["reminders", "notify", "alert"]
    },
    {
        id: 'student-27',
        question: "Can I download invoices?",
        answer: "Yes.",
        keywords: ["invoice", "receipt", "bill"]
    },
    {
        id: 'student-28',
        question: "Is there peer discussion?",
        answer: "Planned feature.",
        keywords: ["peer discussion", "forum", "community chat"]
    },
    {
        id: 'student-29',
        question: "Can I pause subscription?",
        answer: "Depending on policy.",
        keywords: ["pause", "hold subscription"]
    },
    {
        id: 'student-30',
        question: "How do I delete account?",
        answer: "Contact hello@mentozy.app.",
        keywords: ["delete account", "close account", "remove account"]
    },


    // MENTOR QUESTIONS
    {
        id: 'mentor-1',
        question: "How do I become a mentor?",
        answer: "Apply and pass eligibility test.",
        keywords: ["become mentor", "teach", "apply as mentor"]
    },
    {
        id: 'mentor-2',
        question: "Is there an interview?",
        answer: "No long interviews required.",
        keywords: ["interview", "selection process"]
    },
    {
        id: 'mentor-3',
        question: "How do I set pricing?",
        answer: "You set your own pricing.",
        keywords: ["set price", "pricing", "cost", "charge"]
    },
    {
        id: 'mentor-4',
        question: "How do I receive payment?",
        answer: "Via connected payout system.",
        keywords: ["receive payment", "get paid", "payout"]
    },
    {
        id: 'mentor-5',
        question: "What is commission?",
        answer: "8% platform commission.",
        keywords: ["commission", "fees", "cut", "percentage"]
    },
    {
        id: 'mentor-6',
        question: "Can I teach multiple subjects?",
        answer: "Yes.",
        keywords: ["teach multiple", "many subjects"]
    },
    {
        id: 'mentor-7',
        question: "How do I schedule sessions?",
        answer: "Set availability in dashboard.",
        keywords: ["schedule session", "availability", "time slots"]
    },
    {
        id: 'mentor-8',
        question: "Can I reject bookings?",
        answer: "Yes before confirmation.",
        keywords: ["reject", "decline", "refuse"]
    },
    {
        id: 'mentor-9',
        question: "Are payouts weekly?",
        answer: "As per payout cycle.",
        keywords: ["payout cycle", "when paid", "weekly"]
    },
    {
        id: 'mentor-10',
        question: "How do I track earnings?",
        answer: "Mentor dashboard.",
        keywords: ["track earnings", "income", "money made"]
    },
    {
        id: 'mentor-11',
        question: "Is there minimum qualification?",
        answer: "Eligibility test clearance.",
        keywords: ["minimum qualification", "degree needed", "qualified"]
    },
    {
        id: 'mentor-12',
        question: "Can I offer group sessions?",
        answer: "Yes.",
        keywords: ["group sessions", "batch"]
    },
    {
        id: 'mentor-13',
        question: "Can I create courses?",
        answer: "Yes.",
        keywords: ["create course", "make course"]
    },
    {
        id: 'mentor-14',
        question: "Are ratings public?",
        answer: "Yes.",
        keywords: ["ratings public", "visible rating"]
    },
    {
        id: 'mentor-15',
        question: "What if student misbehaves?",
        answer: "Report to hello@mentozy.app.",
        keywords: ["misbehave", "bad behavior", "harassment", "report"]
    },
    {
        id: 'mentor-16',
        question: "Is mentor profile customizable?",
        answer: "Yes.",
        keywords: ["customize profile", "edit profile"]
    },
    {
        id: 'mentor-17',
        question: "Can I pause teaching?",
        answer: "Yes.",
        keywords: ["pause teaching", "break", "vacation"]
    },
    {
        id: 'mentor-18',
        question: "How do I withdraw earnings?",
        answer: "Through payout dashboard.",
        keywords: ["withdraw", "cash out"]
    },
    {
        id: 'mentor-19',
        question: "Is there contract signing?",
        answer: "Terms apply during onboarding.",
        keywords: ["contract", "agreement", "bond"]
    },
    {
        id: 'mentor-20',
        question: "Can organizations hire me?",
        answer: "Yes.",
        keywords: ["hired by organization", "jobs"]
    },
    {
        id: 'mentor-21',
        question: "Is teaching fully remote?",
        answer: "Yes.",
        keywords: ["work from home", "remote teaching"]
    },
    {
        id: 'mentor-22',
        question: "Do I need equipment?",
        answer: "Basic internet and device.",
        keywords: ["equipment", "laptop", "internet", "requirements"]
    },
    {
        id: 'mentor-23',
        question: "Can I change pricing later?",
        answer: "Yes.",
        keywords: ["change price", "update price"]
    },
    {
        id: 'mentor-24',
        question: "How do I improve visibility?",
        answer: "Maintain good ratings.",
        keywords: ["visibility", "more students", "ranking"]
    },
    {
        id: 'mentor-25',
        question: "Can I run promotions?",
        answer: "Future feature.",
        keywords: ["promotions", "ads"]
    },
    {
        id: 'mentor-26',
        question: "Are there teaching guidelines?",
        answer: "Yes.",
        keywords: ["guidelines", "rules", "policy"]
    },
    {
        id: 'mentor-27',
        question: "Do you provide curriculum?",
        answer: "Optional.",
        keywords: ["curriculum", "syllabus", "content"]
    },
    {
        id: 'mentor-28',
        question: "How is commission calculated?",
        answer: "8% per transaction.",
        keywords: ["calculate commission", "fees calculation"]
    },
    {
        id: 'mentor-29',
        question: "Is tax handled by Mentozy?",
        answer: "Mentors handle own taxes.",
        keywords: ["tax", "gst", "tds"]
    },
    {
        id: 'mentor-30',
        question: "How do I deactivate mentor profile?",
        answer: "Contact hello@mentozy.app.",
        keywords: ["deactivate", "quit", "leave"]
    },

    // BUSINESS & MONETIZATION
    {
        id: 'biz-1',
        question: "How does Mentozy earn money?",
        answer: "8% commission + subscriptions + organization fees.",
        keywords: ["revenue", "earn money", "business model"]
    },
    {
        id: 'biz-2',
        question: "Is there venture funding?",
        answer: "Not publicly disclosed.",
        keywords: ["funding", "investors", "vc"]
    },
    {
        id: 'biz-3',
        question: "Do you plan to scale globally?",
        answer: "Yes.",
        keywords: ["scale", "expansion", "future plans"]
    },

    // BUSINESS & MONETIZATION (Continued)
    {
        id: 'biz-4',
        question: "What is your revenue model?",
        answer: "Multi-source model.",
        keywords: ["revenue model", "how do you make money"]
    },
    {
        id: 'biz-5',
        question: "Are you profitable?",
        answer: "Scaling phase.",
        keywords: ["profitable", "profit"]
    },
    {
        id: 'biz-6',
        question: "Can investors contact you?",
        answer: "hello@mentozy.app",
        keywords: ["investor", "invest", "funding"]
    },
    {
        id: 'biz-7',
        question: "Is there enterprise pricing?",
        answer: "Yes.",
        keywords: ["enterprise", "corporate", "business pricing"]
    },
    {
        id: 'biz-8',
        question: "How many users?",
        answer: "For specific queries like this please contact Mentozy by hello@mentozy.app.",
        keywords: ["user count", "number of users", "how many students"]
    },
    {
        id: 'biz-9',
        question: "How many paying users?",
        answer: "For specific queries like this please contact Mentozy by hello@mentozy.app.",
        keywords: ["paying users", "subscribers"]
    },
    {
        id: 'biz-10',
        question: "Who pays the most?",
        answer: "For specific queries like this please contact Mentozy by hello@mentozy.app.",
        keywords: ["highest payer", "top customer"]
    },
    {
        id: 'biz-11',
        question: "What is long term vision?",
        answer: "Global peer-powered education.",
        keywords: ["vision", "long term", "future"]
    },
    {
        id: 'biz-12',
        question: "Are you expanding features?",
        answer: "Yes.",
        keywords: ["new features", "roadmap", "updates"]
    },
    {
        id: 'biz-13',
        question: "Do you integrate AI?",
        answer: "Planned integrations.",
        keywords: ["ai integration", "artificial intelligence"]
    },
    {
        id: 'biz-14',
        question: "What tech stack?",
        answer: "React.js, Node.js, Next.js, AI integrations.",
        keywords: ["tech stack", "technology", "built with"]
    },
    {
        id: 'biz-15',
        question: "Is there white-label solution?",
        answer: "Contact hello@mentozy.app.",
        keywords: ["white label", "branding"]
    },
    {
        id: 'biz-16',
        question: "Can organizations partner?",
        answer: "Yes.",
        keywords: ["partner", "partnership", "collab"]
    },
    {
        id: 'biz-17',
        question: "Do you take ads?",
        answer: "Currently no.",
        keywords: ["ads", "advertising", "promote"]
    },
    {
        id: 'biz-18',
        question: "What is projected growth?",
        answer: "Contact hello@mentozy.app.",
        keywords: ["growth", "projection", "forecast"]
    },
    {
        id: 'biz-19',
        question: "Can I franchise Mentozy?",
        answer: "Contact hello@mentozy.app.",
        keywords: ["franchise", "branch"]
    },
    {
        id: 'biz-20',
        question: "Do you plan offline centers?",
        answer: "Currently digital-first.",
        keywords: ["offline", "centers", "physical location"]
    },


    // GREETINGS & SMALL TALK
    {
        id: 'greet-1',
        question: "Hi",
        answer: "Hello. Welcome to Mentozy.",
        keywords: ["hi", "hello", "hey", "greetings"]
    },
    {
        id: 'greet-2',
        question: "Good morning",
        answer: "Good morning.",
        keywords: ["good morning", "morning"]
    },
    {
        id: 'greet-3',
        question: "Good evening",
        answer: "Good evening.",
        keywords: ["good evening", "evening"]
    },
    {
        id: 'greet-4',
        question: "How are you?",
        answer: "I’m functioning perfectly.",
        keywords: ["how are you", "how r u", "doing"]
    },
    {
        id: 'greet-5',
        question: "Are you fine?",
        answer: "Yes.",
        keywords: ["are you fine", "you okay"]
    },
    {
        id: 'greet-6',
        question: "What’s up?",
        answer: "Ready to assist.",
        keywords: ["whats up", "wats up"]
    },
    {
        id: 'greet-7',
        question: "Thanks",
        answer: "You’re welcome.",
        keywords: ["thanks", "thx"]
    },
    {
        id: 'greet-8',
        question: "Thank you",
        answer: "Happy to help.",
        keywords: ["thank you"]
    },
    {
        id: 'greet-9',
        question: "Bye",
        answer: "Goodbye.",
        keywords: ["bye", "goodbye", "cya"]
    },
    {
        id: 'greet-10',
        question: "See you",
        answer: "See you soon.",
        keywords: ["see you", "later"]
    },
    {
        id: 'greet-11',
        question: "Who are you?",
        answer: "A messenger in Mahabharat but now a Messenger for Mentozy you want to know anything about Mentozy?",
        keywords: ["who are you", "your name"]
    },
    {
        id: 'greet-12',
        question: "Are you human?",
        answer: "No.",
        keywords: ["are you human", "real person"]
    },
    {
        id: 'greet-13',
        question: "Are you AI?",
        answer: "Yes.",
        keywords: ["are you ai", "are you bot"]
    },
    {
        id: 'greet-14',
        question: "What can you do?",
        answer: "Guide you on Mentozy.",
        keywords: ["what can you do", "capabilities"]
    },
    {
        id: 'greet-15',
        question: "Help",
        answer: "Tell me what you need.",
        keywords: ["help", "support", "assist"]
    },
    {
        id: 'greet-16',
        question: "I’m new",
        answer: "Welcome to Mentozy.",
        keywords: ["i am new", "new here"]
    },
    {
        id: 'greet-17',
        question: "Guide me",
        answer: "Would you like to learn or teach?",
        keywords: ["guide me", "show me around"]
    },
    {
        id: 'greet-18',
        question: "Nice",
        answer: "Glad to hear that.",
        keywords: ["nice", "good", "great"]
    },
    {
        id: 'greet-19',
        question: "Cool",
        answer: "Let me know if you need help.",
        keywords: ["cool", "awesome"]
    },
    {
        id: 'greet-20',
        question: "Okay",
        answer: "Understood.",
        keywords: ["okay", "ok", "k"]
    },
    {
        id: 'greet-21',
        question: "What is your name?",
        answer: "Mentozy Assistant.",
        keywords: ["your name"]
    },
    {
        id: 'greet-22',
        question: "Is this automated?",
        answer: "Yes.",
        keywords: ["automated", "automatic"]
    },
    {
        id: 'greet-23',
        question: "Can I talk to human?",
        answer: "Contact hello@mentozy.app.",
        keywords: ["talk to human", "real person", "agent"]
    },
    {
        id: 'greet-24',
        question: "Are you available 24/7?",
        answer: "Yes.",
        keywords: ["24/7", "available always"]
    },
    {
        id: 'greet-25',
        question: "Good job",
        answer: "Thank you.",
        keywords: ["good job", "well done"]
    },
    {
        id: 'greet-26',
        question: "That’s helpful",
        answer: "Glad it helped.",
        keywords: ["helpful", "useful"]
    },
    {
        id: 'greet-27',
        question: "I’m confused",
        answer: "Please specify your question.",
        keywords: ["confused", "don't understand"]
    },
    {
        id: 'greet-28',
        question: "I need help",
        answer: "Sure. What do you need?",
        keywords: ["need help"]
    },

    // FALLBACK & EDGE RESPONSES
    {
        id: 'edge-1',
        question: "I have a complaint",
        answer: "Contact hello@mentozy.app.",
        keywords: ["complaint", "complain", "issue"]
    },
    {
        id: 'edge-2',
        question: "Payment failed",
        answer: "Contact hello@mentozy.app.",
        keywords: ["payment failed", "transaction failed"]
    },
    {
        id: 'edge-3',
        question: "Refund issue",
        answer: "Contact hello@mentozy.app.",
        keywords: ["refund issue", "refund problem"]
    },
    {
        id: 'edge-4',
        question: "Account blocked",
        answer: "Contact hello@mentozy.app.",
        keywords: ["blocked", "banned", "suspended"]
    },
    {
        id: 'edge-5',
        question: "Technical issue",
        answer: "Contact hello@mentozy.app.",
        keywords: ["technical issue", "bug", "glitch", "error"]
    },
    {
        id: 'edge-6',
        question: "Bug report",
        answer: "Contact hello@mentozy.app.",
        keywords: ["bug report"]
    },
    {
        id: 'edge-7',
        question: "Delete data",
        answer: "Contact hello@mentozy.app.",
        keywords: ["delete data", "remove data", "privacy"]
    },
    {
        id: 'edge-8',
        question: "Privacy concern",
        answer: "Contact hello@mentozy.app.",
        keywords: ["privacy concern"]
    },
    {
        id: 'edge-9',
        question: "Partnership inquiry",
        answer: "Contact hello@mentozy.app.",
        keywords: ["partnership inquiry"]
    },
    {
        id: 'edge-10',
        question: "Media inquiry",
        answer: "Contact hello@mentozy.app.",
        keywords: ["media inquiry", "press"]
    },
    {
        id: 'edge-11',
        question: "Investor inquiry",
        answer: "Contact hello@mentozy.app.",
        keywords: ["investor inquiry"]
    },
    {
        id: 'edge-12',
        question: "Legal concern",
        answer: "Contact hello@mentozy.app.",
        keywords: ["legal", "lawsuit"]
    },
    {
        id: 'edge-13',
        question: "Policy clarification",
        answer: "Contact hello@mentozy.app.",
        keywords: ["policy", "terms"]
    },
    {
        id: 'edge-14',
        question: "Feature request",
        answer: "Contact hello@mentozy.app.",
        keywords: ["feature request", "suggestion"]
    },
    {
        id: 'edge-15',
        question: "Data access request",
        answer: "Contact hello@mentozy.app.",
        keywords: ["data access", "my data"]
    },
    {
        id: 'edge-16',
        question: "Escalate issue",
        answer: "Contact hello@mentozy.app.",
        keywords: ["escalate", "manager"]
    },
    {
        id: 'edge-17',
        question: "Account recovery",
        answer: "Contact hello@mentozy.app.",
        keywords: ["recover account", "lost access"]
    },
    {
        id: 'edge-18',
        question: "Suspicious activity",
        answer: "Contact hello@mentozy.app.",
        keywords: ["suspicious", "hacked"]
    },
    {
        id: 'edge-19',
        question: "Teacher dispute",
        answer: "Contact hello@mentozy.app.",
        keywords: ["dispute teacher", "mentor issue"]
    },
    {
        id: 'edge-20',
        question: "Student dispute",
        answer: "Contact hello@mentozy.app.",
        keywords: ["dispute student"]
    }
];
