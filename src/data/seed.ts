import type { ShelterState } from './types';

const DAY = 86_400_000;

/** ISO day string offset from today, so the calendar is always "this week". */
function day(offset: number): string {
  return new Date(Date.now() + offset * DAY).toISOString().slice(0, 10);
}

const ago = (mins: number) => Date.now() - mins * 60_000;

/**
 * Prototype content for a fictional shelter. Phone numbers in the 555-01xx range
 * are reserved for fiction; the national hotlines below are real and correct,
 * because those are the numbers that would actually help someone reading this.
 */
export function createSeedState(): ShelterState {
  return {
    profile: {
      name: 'VeraWell House',
      tagline: 'Safe shelter, advocacy, and a way forward.',
      crisisLine: '+15550104357',
      officePhone: '+15550104100',
      donateUrl: 'https://example.org/verawell/donate',
      website: 'https://example.org/verawell',
      socials: [
        { label: 'Instagram', url: 'https://instagram.com/', icon: 'logo-instagram' },
        { label: 'Facebook', url: 'https://facebook.com/', icon: 'logo-facebook' },
      ],
    },

    needs: [
      {
        id: 'n1',
        title: 'Twin sheet sets',
        note: 'New or gently used. We go through these fastest.',
        urgency: 'urgent',
        category: 'bedding',
        updatedAt: ago(220),
      },
      {
        id: 'n2',
        title: 'Diapers — sizes 4, 5, 6',
        note: 'We are well stocked on newborn.',
        urgency: 'urgent',
        category: 'kids',
        updatedAt: ago(220),
      },
      {
        id: 'n3',
        title: 'Grocery gift cards',
        note: 'Lets families choose what they actually eat.',
        urgency: 'ongoing',
        category: 'food',
        updatedAt: ago(1450),
      },
      {
        id: 'n4',
        title: 'Full-size shampoo & conditioner',
        urgency: 'ongoing',
        category: 'hygiene',
        updatedAt: ago(1450),
      },
      {
        id: 'n5',
        title: 'Laundry detergent (HE)',
        urgency: 'ongoing',
        category: 'household',
        updatedAt: ago(2900),
      },
      {
        id: 'n6',
        title: 'Canned goods',
        note: 'Pantry is full this week — thank you.',
        urgency: 'stocked',
        category: 'food',
        updatedAt: ago(4300),
      },
    ],

    alerts: [
      {
        id: 'a1',
        kind: 'weather',
        body: 'Winter storm warning tonight. Heat is on in all wings; extra blankets are in the second-floor linen closet.',
        createdAt: ago(75),
        expiresAt: Date.now() + DAY,
      },
      {
        id: 'a2',
        kind: 'delivery',
        body: 'Grocery delivery arrived. Fresh produce is in the kitchen — help yourself.',
        createdAt: ago(190),
        expiresAt: Date.now() + DAY / 2,
      },
      {
        id: 'a3',
        kind: 'info',
        body: 'The laundry room on floor 2 is back in service.',
        createdAt: ago(760),
      },
    ],

    calendar: [
      { id: 'c1', day: day(0), time: '07:00', endTime: '09:00', title: 'Breakfast', kind: 'meal', location: 'Dining room' },
      { id: 'c2', day: day(0), time: '10:00', endTime: '11:00', title: 'Housing support group', kind: 'group', location: 'Community room' },
      { id: 'c3', day: day(0), time: '12:00', endTime: '13:30', title: 'Lunch', kind: 'meal', location: 'Dining room' },
      { id: 'c4', day: day(0), time: '15:00', endTime: '16:00', title: 'Kids’ homework hour', kind: 'group', location: 'Library nook' },
      { id: 'c5', day: day(0), time: '17:30', endTime: '19:00', title: 'Dinner', kind: 'meal', location: 'Dining room' },
      { id: 'c6', day: day(0), time: '20:00', title: 'Common areas close', kind: 'chore' },
      { id: 'c7', day: day(0), time: '22:00', title: 'Quiet hours begin', kind: 'curfew' },

      { id: 'c8', day: day(1), time: '07:00', endTime: '09:00', title: 'Breakfast', kind: 'meal', location: 'Dining room' },
      { id: 'c9', day: day(1), time: '09:30', endTime: '11:30', title: 'Legal aid drop-in', kind: 'appointment', location: 'Front office', note: 'No appointment needed. Ask any advocate.' },
      { id: 'c10', day: day(1), time: '12:00', endTime: '13:30', title: 'Lunch', kind: 'meal', location: 'Dining room' },
      { id: 'c11', day: day(1), time: '17:30', endTime: '19:00', title: 'Dinner', kind: 'meal', location: 'Dining room' },
      { id: 'c12', day: day(1), time: '22:00', title: 'Quiet hours begin', kind: 'curfew' },

      { id: 'c13', day: day(2), time: '07:00', endTime: '09:00', title: 'Breakfast', kind: 'meal', location: 'Dining room' },
      { id: 'c14', day: day(2), time: '13:00', endTime: '14:30', title: 'Job readiness workshop', kind: 'group', location: 'Community room' },
      { id: 'c15', day: day(2), time: '17:30', endTime: '19:00', title: 'Dinner', kind: 'meal', location: 'Dining room' },
      { id: 'c16', day: day(2), time: '22:00', title: 'Quiet hours begin', kind: 'curfew' },
    ],

    shift: {
      advocatesOnShift: 3,
      officeOpen: true,
      note: 'Front office is staffed through the night.',
      nextChangeover: '23:00',
      updatedAt: ago(40),
    },

    threads: [
      {
        id: 't-demo',
        guestCode: 'HARBOR-482',
        topic: 'Bus pass',
        urgent: false,
        createdAt: ago(300),
        unreadForStaff: 0,
        unreadForGuest: 1,
        messages: [
          { id: 'm1', from: 'guest', body: 'Is there a bus pass available for a job interview on Thursday?', createdAt: ago(300) },
          { id: 'm2', from: 'advocate', body: 'Yes — come by the front office any time today and we will get one to you. Good luck Thursday.', createdAt: ago(240) },
        ],
      },
    ],

    publicMessages: [
      {
        id: 'p1',
        name: 'Rosa M.',
        contactBack: 'rosa@example.com',
        topic: 'donation',
        body: 'Our book club would like to put together twenty hygiene kits. Who should we coordinate with?',
        createdAt: ago(520),
        handled: false,
      },
    ],

    codes: [
      { code: 'HARBOR-482', label: 'Room 2A', issuedAt: ago(4300), active: true },
      { code: 'WILLOW-315', label: 'Room 3C', issuedAt: ago(1500), active: true },
      { code: 'CEDAR-207', label: 'Room 1B — checked out', issuedAt: ago(20000), active: false },
    ],

    guidelines: [
      {
        id: 'g1',
        title: 'Confidentiality',
        icon: 'shield-checkmark-outline',
        items: [
          'We never confirm to anyone outside the house that you are staying here.',
          'Please do not share other residents’ names, rooms, or stories.',
          'No photos or video anywhere inside the building.',
          'Do not post the shelter’s location or tag it on social media.',
        ],
      },
      {
        id: 'g2',
        title: 'Quiet hours',
        icon: 'moon-outline',
        items: [
          'Quiet hours run 10:00 pm to 7:00 am.',
          'Common areas close at 8:00 pm; the kitchen stays open for drinks.',
          'Headphones after 10:00 pm, please.',
        ],
      },
      {
        id: 'g3',
        title: 'Shared spaces',
        icon: 'people-outline',
        items: [
          'Label anything you put in the fridge with your room number.',
          'Everyone takes one chore a week — the list is posted in the hall.',
          'Laundry is first come, first served; please empty the machine when it stops.',
        ],
      },
      {
        id: 'g4',
        title: 'Coming and going',
        icon: 'key-outline',
        items: [
          'Your key fob works at the side entrance at any hour.',
          'Let an advocate know if you will be away overnight so we hold your room.',
          'Guests and visitors are not permitted inside the building.',
        ],
      },
      {
        id: 'g5',
        title: 'Kids',
        icon: 'happy-outline',
        items: [
          'Children under 12 stay with a parent in common areas.',
          'The library nook is open to families all day.',
          'Strollers park in the entry alcove, not the stairwells.',
        ],
      },
    ],

    resources: [
      {
        id: 'r1',
        name: 'National Domestic Violence Hotline',
        description: 'Free, confidential support 24/7. Call, chat, or text START to 88788.',
        phone: '+18007997233',
        url: 'https://www.thehotline.org',
        category: 'crisis',
        available: '24 hours',
      },
      {
        id: 'r2',
        name: '988 Suicide & Crisis Lifeline',
        description: 'Call or text 988 to reach a trained counselor any time.',
        phone: '988',
        url: 'https://988lifeline.org',
        category: 'crisis',
        available: '24 hours',
      },
      {
        id: 'r3',
        name: '211 Community Services',
        description: 'Local referrals for housing, food, utilities, and childcare.',
        phone: '211',
        url: 'https://www.211.org',
        category: 'housing',
        available: '24 hours',
      },
      {
        id: 'r4',
        name: 'County Legal Aid',
        description: 'Protective orders, custody, and housing disputes at no cost.',
        phone: '+15550104220',
        category: 'legal',
        available: 'Mon–Fri, 9–5',
      },
      {
        id: 'r5',
        name: 'Riverside Community Clinic',
        description: 'Walk-in medical care on a sliding scale. No insurance required.',
        phone: '+15550104811',
        category: 'health',
        available: 'Mon–Sat, 8–6',
      },
      {
        id: 'r6',
        name: 'Eastside Food Pantry',
        description: 'Groceries twice a month. Bring any ID you have — none is fine too.',
        phone: '+15550104533',
        category: 'food',
        available: 'Tue & Thu, 10–2',
      },
    ],

    safety: [
      {
        id: 's1',
        kind: 'personal',
        title: 'If you feel unsafe',
        summary: 'Inside the building or out, this is the fastest way to reach help.',
        steps: [
          'If you are in immediate danger, call 911.',
          'Inside the house, go to the front office — it is staffed around the clock.',
          'Any advocate can walk you to your room or to a different floor.',
          'If someone has found out where you are staying, tell an advocate right away. We can change your room and review building access the same day.',
        ],
        callLabel: 'Call 911',
        callNumber: '911',
      },
      {
        id: 's2',
        kind: 'fire',
        title: 'Fire',
        summary: 'Two exits per floor. Both stairwells lead to the parking lot.',
        steps: [
          'Pull the nearest alarm and leave — do not stop to gather belongings.',
          'Take the stairs. Never the elevator.',
          'Close doors behind you as you go.',
          'Meet at the far end of the parking lot, past the fence.',
          'An advocate will take a head count. Stay until you are counted.',
        ],
        callLabel: 'Call 911',
        callNumber: '911',
      },
      {
        id: 's3',
        kind: 'weather',
        title: 'Severe weather',
        summary: 'The basement corridor is the shelter-in-place area.',
        steps: [
          'For a tornado warning, go to the basement corridor away from windows.',
          'Bring shoes and a coat if you have a moment — not more.',
          'During a power outage, stay put; emergency lighting comes on in the halls.',
          'Advocates will check every room. Do not go looking for staff.',
        ],
      },
      {
        id: 's4',
        kind: 'medical',
        title: 'Medical emergency',
        summary: 'Call 911 first, then tell an advocate so they can meet the ambulance.',
        steps: [
          'Call 911 and stay with the person if it is safe to do so.',
          'Send someone to the front office, or message an advocate from this app.',
          'An advocate will meet paramedics at the side entrance and bring them up.',
          'A first aid kit is mounted in every hallway beside the exit sign.',
        ],
        callLabel: 'Call 911',
        callNumber: '911',
      },
    ],

    news: [
      {
        id: 'nw1',
        title: 'Winter coat drive starts Saturday',
        body: 'Drop off clean, zipped coats in any size at the front office, Saturday through the end of the month. Children’s sizes go fastest.',
        pinned: true,
        createdAt: ago(300),
      },
      {
        id: 'nw2',
        title: 'Thank you, Maple Street Church',
        body: 'Forty-two grocery bags arrived this week. Every one of them went home with a family within a day.',
        createdAt: ago(4300),
      },
      {
        id: 'nw3',
        title: 'New: legal clinic, first Tuesday of the month',
        body: 'A volunteer attorney will hold free walk-in hours at the front office. Guests can book a slot through an advocate.',
        createdAt: ago(9000),
      },
    ],

    ways: [
      {
        id: 'w1',
        title: 'Run a supply drive',
        description: 'Collect from your workplace, school or congregation. We will send a one-page list of what is needed most.',
        kind: 'drive',
        when: 'Any time',
      },
      {
        id: 'w2',
        title: 'Drop off donations',
        description: 'Bring items to the front office during business hours. Please call ahead; do not leave bags outside.',
        kind: 'dropoff',
        when: 'Mon–Fri, 9am–5pm',
      },
      {
        id: 'w3',
        title: 'Offer a skill',
        description: 'Haircuts, résumé help, tutoring, bike repair, tax prep. If you can teach or fix it, we can probably use it.',
        kind: 'skills',
      },
      {
        id: 'w4',
        title: 'Spring clean-up day',
        description: 'Yard work, painting and deep cleaning of common rooms with the house crew.',
        kind: 'event',
        when: 'Second Saturday, 9am',
      },
    ],

    amenities: [
      {
        id: 'am1',
        name: 'Laundry room',
        description: 'Two washers and two dryers. Detergent pods are on the shelf above.',
        location: 'Basement, past the stairwell',
        hours: '7am – 9pm',
      },
      {
        id: 'am2',
        name: 'Computer corner',
        description: 'Three computers with printing, for job applications and benefits forms.',
        location: 'Common room, east wall',
        hours: '9am – 8pm',
      },
      {
        id: 'am3',
        name: 'Children’s play room',
        description: 'Books, toys and a quiet corner. A grown-up needs to stay with children.',
        location: 'First floor, next to the kitchen',
        hours: '8am – 7pm',
      },
      {
        id: 'am4',
        name: 'Clothing closet',
        description: 'Free clothing, coats and shoes. Take what you need.',
        location: 'Second floor landing',
        hours: 'Tue & Thu, 1pm – 4pm',
      },
      {
        id: 'am5',
        name: 'Quiet room',
        description: 'No phones on speaker, no visitors, lights low. For rest, prayer or a breather.',
        location: 'Second floor, end of the hall',
      },
    ],

    places: [
      {
        id: 'pl1',
        name: 'Route 12 bus',
        kind: 'transit',
        note: 'Runs every 15 minutes to downtown and the hospital. Bus passes are available from advocates.',
        distance: '2 min walk',
        address: 'Corner of Elm and 4th',
      },
      {
        id: 'pl2',
        name: 'Greenfield Market',
        kind: 'grocery',
        note: 'Accepts SNAP and WIC. Cheapest produce on this side of town.',
        distance: '8 min walk',
        address: '210 Elm Street',
      },
      {
        id: 'pl3',
        name: 'Riverside Community Clinic',
        kind: 'clinic',
        note: 'Sliding-scale fees. No insurance needed. Walk-ins before noon.',
        distance: '15 min walk or bus 12',
        address: '55 River Road',
        phone: '+15550104500',
      },
      {
        id: 'pl4',
        name: 'Corner Pharmacy',
        kind: 'pharmacy',
        note: 'Will transfer prescriptions and fills most within the hour.',
        distance: '6 min walk',
        address: '18 Main Street',
      },
      {
        id: 'pl5',
        name: 'Central Library',
        kind: 'library',
        note: 'Free cards, free Wi-Fi, free printing for the first 20 pages a week.',
        distance: 'Bus 12, 4 stops',
        address: '1 Library Plaza',
      },
    ],

    library: [
      {
        id: 'lb1',
        title: 'Your rights while you stay here',
        summary: 'What the shelter can and cannot ask of you.',
        category: 'rights',
        body: 'You can leave at any time. You can ask to see any rule in writing, and ask why it exists.\n\nStaff cannot go through your belongings without telling you why, and cannot share anything about you without your say-so, except where the law requires them to.\n\nIf you think a rule is being applied unfairly, tell an advocate or use the anonymous feedback form. Neither will count against you.',
      },
      {
        id: 'lb2',
        title: 'Finding permanent housing',
        summary: 'The usual steps, and where an advocate can help.',
        category: 'housing',
        body: 'Start with a housing application packet. An advocate can help you gather ID, income proof and references.\n\nGet on every waitlist you qualify for; they move at different speeds, and being on several costs nothing.\n\nAsk about rapid rehousing, which can cover first month’s rent and a deposit.',
      },
      {
        id: 'lb3',
        title: 'Getting a replacement ID',
        summary: 'Birth certificate, state ID and Social Security card, in the order that works.',
        category: 'money',
        body: 'Begin with the birth certificate; most other documents need it. Your birth state’s vital records office handles requests by mail or online.\n\nWith the birth certificate you can apply for a state ID. Ask an advocate about the fee waiver for people staying in shelter.\n\nThe Social Security card is last. Bring your ID and the form; the office is on Route 12.',
      },
      {
        id: 'lb4',
        title: 'Getting care without insurance',
        summary: 'Clinics, free prescriptions and what to say at the desk.',
        category: 'health',
        body: 'Community clinics charge by what you can pay, and some charge nothing. Say “I do not have insurance” at the desk; they have a form for it.\n\nPharmacies often have a $4 generic list. Ask before you pay.\n\nIf you are pregnant or have children, you may qualify for coverage today. An advocate can help you apply.',
      },
      {
        id: 'lb5',
        title: 'Staying safe online',
        summary: 'Phones, passwords and location sharing.',
        category: 'safety',
        body: 'Turn off location sharing in your phone settings, and in any app that offers it.\n\nChange passwords from a device the other person has never touched.\n\nIf you think a phone is being monitored, use a library computer for sensitive searches, and tell an advocate.',
      },
    ],

    communityRequests: [],

    chores: [
      { id: 'ch1', title: 'Wipe kitchen counters and stove', area: 'Kitchen' },
      { id: 'ch2', title: 'Sweep and mop the dining room', area: 'Kitchen' },
      { id: 'ch3', title: 'Empty common-room trash', area: 'Common room' },
      { id: 'ch4', title: 'Wipe down bathroom sinks', area: 'Bathrooms' },
      { id: 'ch5', title: 'Fold and shelve laundry-room towels', area: 'Laundry', doneAt: ago(90) },
    ],

    feedback: [
      {
        id: 'fb1',
        kind: 'idea',
        body: 'Could the laundry room open earlier on weekends? A lot of us work early shifts.',
        createdAt: ago(5000),
        status: 'resolved',
        publicReply: 'Laundry now opens at 7am every day, including weekends.',
      },
    ],

    wishlist: [
      {
        id: 'wl1',
        kind: 'grocery',
        title: 'Rice and dried beans, large bags',
        createdAt: ago(1500),
        status: 'requested',
      },
      {
        id: 'wl2',
        kind: 'big-ticket',
        title: 'A second microwave for the kitchen',
        note: 'Queue at dinner is long.',
        createdAt: ago(2600),
        status: 'requested',
      },
    ],

    referrals: [],
  };
}
