import type { InvitationViewModel } from '../types/invitation'

const address = 'Vila Mutiara Gading 2 Blok B6 No. 29, Karangsatria, Tambun Utara, Kabupaten Bekasi, Jawa Barat'
const mapUrl = 'https://maps.app.goo.gl/rx6Dnt7xfQPiWhsA8'
const sampleWishes = [
  ['Rozak', '20 Juli 2026 pukul 02.05', 'Selamat perpaduan yang sangat menarik ❤️❤️❤️'],
  ['Nama Tamu', '18 Juli 2026 pukul 15.48', 'Wishing you both a lifetime of laughter, patience, and beautiful memories together.'],
  ['Alya', '15 Juli 2026 pukul 09.25', 'Congratulations Bayu and Hilwa. May each day bring a new reason to smile.'],
  ['Michael', '12 Juli 2026 pukul 16.10', 'So happy to celebrate this chapter with you. Sending much love to you both!'],
  ['Christina', '10 Juli 2026 pukul 08.32', 'A beautiful beginning for two wonderful souls. Best wishes always.'],
  ['Daniel', '7 Juli 2026 pukul 20.14', 'May your journey be filled with kindness, adventure, and all the quiet moments that matter most.'],
  ['Rina', '3 Juli 2026 pukul 11.40', 'Congratulations on your wedding! Wishing you a joyful life together.'],
  ['Hannah', '28 Juni 2026 pukul 18.20', 'Your story is inspiring. Here is to many more adventures side by side.'],
  ['David', '25 Juni 2026 pukul 12.03', 'Wishing you endless happiness and a celebration to remember.'],
  ['Amanda', '22 Juni 2026 pukul 14.58', 'May you always find home in one another, wherever the road takes you.'],
  ['Samuel', '20 Juni 2026 pukul 07.15', 'All our love and best wishes for your special day.'],
  ['Nadia', '18 Juni 2026 pukul 09.09', 'May your love continue to grow through every season. Congratulations!'],
  ['Joshua', '12 Juni 2026 pukul 22.31', 'Excited to see where this wonderful story goes next. Much love!'],
  ['Elena', '9 Juni 2026 pukul 17.42', 'A lifetime of joy to the two of you. Congratulations!'],
] as const

export const invitationFixture: InvitationViewModel = {
  slug: 'demo',
  couple: { firstName: 'Bayu', secondName: 'Hilwa' },
  accessState: 'LIVE_PUBLIC',
  lifecycle: 'UPCOMING_RSVP_OPEN',
  content: {
    cover: { imageId: 'cover', eyebrow: 'The Wedding of', names: 'Bayu - Hilwa', dateLabel: 'SATURDAY, 26 DECEMBER 2026', apology: 'We apologize if there is any misspelling of name or title' },
    hero: {
      posterId: 'hero-kv', foregroundId: 'hero-kv-foreground', videoSrc: null, audioSrc: null, occasion: 'THE WEDDING OF', names: 'Bayu - Hilwa', dateLabel: 'SATURDAY, 26 DECEMBER 2026',
      scripture: '“And among His signs is that Allah created for you spouses from among yourselves, so that you may find tranquility in them, and Allah placed between you love and mercy.”',
      attribution: 'Ar-Rum 30:21',
    },
    quote: { text: 'A lifetime begins with two hearts choosing each other.', imageIds: ['quote-a', 'quote-b', 'quote-c'] },
    profiles: [
      { id: 'bride', role: 'THE BRIDE', nickname: 'Hilwa', fullName: 'Hilwa Qurrotul Aina', parentLines: ['The Daughter of', 'Mr. Andi Chayadi', 'Mrs. Irma Nur Azizah'], imageId: 'bride', socialHandle: '@_hiqurai', socialUrl: 'https://instagram.com/_hiqurai' },
      { id: 'groom', role: 'THE GROOM', nickname: 'Bayu', fullName: 'Bayu Fajariyanto', parentLines: ['The Son of', 'Mr. Suprijono', 'Mrs. Lina Faradiba'], imageId: 'groom', socialHandle: '@bayufajar.design', socialUrl: 'https://instagram.com/bayufajar.design' },
    ],
    story: {
      caption: 'A Journey in Love', imageIds: ['story-1', 'story-2', 'story-3', 'story-4', 'story-5', 'story-6'],
      chapters: [
        { id: 'chapter-2023', year: '2023', title: 'The First Encounter', paragraphs: [
          'It all began in the spring of 2023 when Bayu, a kind-hearted and adventurous soul, arrived in Japan for work. New to the country, he found himself walking along the bustling streets of Tokyo, captivated by the neon lights and the mix of tradition and modernity. On one of his many explorations, Bayu stumbled upon a cozy café hidden in a quiet alley, its warm ambiance calling him inside.',
          'Inside the café, Hilwa, a soft-spoken artist with a passion for storytelling through her paintings, was sipping tea and sketching. Their eyes met briefly, and there was an instant connection. Bayu couldn’t resist walking up to her and struck up a conversation about the art on the café walls. What started as a casual chat about creativity soon turned into hours of deep conversation. They shared stories of their lives, their dreams, and the serendipity that had led them to Japan. It felt as though they had known each other forever.',
        ] },
        { id: 'chapter-2024', year: '2024', title: 'The First Encounter', paragraphs: [
          'Over the next year, Bayu and Hilwa spent more and more time together. They explored the beauty of Japan – from the serene temples of Kyoto to the cherry blossoms in full bloom. With every passing moment, their bond deepened. Bayu admired Hilwa’s gentle spirit and her ability to find beauty in the simplest things. Hilwa, on the other hand, was drawn to Bayu’s adventurous nature and how he always made her laugh, even on the hardest days.',
          'Their love story wasn’t just about grand adventures but also about the quiet moments shared in the comfort of their home in Japan – cooking meals together, long walks in the park, and nights filled with laughter and dreams of the future. They both knew, deep down, that this was more than just a passing connection. It was something meant to last a lifetime.',
        ] },
        { id: 'chapter-2025', year: '2025', title: 'The Proposal', paragraphs: [
          'By early 2025, it was clear to both Bayu and Hilwa that they were meant to be together forever. Bayu planned a special evening for Hilwa, taking her to the very café where they first met. As they sat by the same window, looking out at the Tokyo skyline, Bayu took Hilwa’s hand and spoke from the heart. He told her how much she meant to him and how he couldn’t imagine his life without her.',
          'With a smile that lit up her face, Hilwa said yes.',
          'Their love story was about to take the next step as they began planning their wedding for later that year, excited to build a future together, full of love, laughter, and the beautiful memories they would create in Japan and beyond.',
        ] },
      ],
    },
    celebration: {
      imageId: 'celebration',
      ribbon: '/ Almost Time For Our Celebration',
      calendar: {
        uid: 'bayu-hilwa-wedding',
        title: 'Akad Nikah Bayu & Hilwa',
        startsAt: '2026-12-26T08:00:00+07:00',
        endsAt: '2026-12-26T10:00:00+07:00',
        location: address,
      },
    },
    events: { label: 'Wedding / Details', weekday: 'Saturday', dateLabel: '26 December 2026', rows: [
      { id: 'matrimony', label: 'Akad Nikah', lines: ['8 AM - 10 AM', address], action: { label: 'Open ceremony map', url: mapUrl }, colors: [] },
      { id: 'reception', label: 'Resepsi', lines: ['10 AM - 2 PM', address], action: { label: 'Open reception map', url: mapUrl }, colors: [] },
    ] },
    gift: { introduction: 'For those of you who want to give a token of love to the bride and groom, you can use the account number below:', imageId: 'gift', banks: [
      { id: 'preview-a', bank: 'BRI', holder: 'Bayu Fajariyanto', account: '0065 0109 6921 501' },
      { id: 'preview-b', bank: 'BCA', holder: 'Hilwa Qurrotul Aina', account: '6631 3812 83' },
      { id: 'preview-c', bank: '', holder: 'Address for sending gifts :', account: 'Vila Mutiara Gading 2 Blok B6 No. 29, Karangsatria, Tambun Utara, Kabupaten Bekasi, Jawa Barat' },
    ] },
    rsvp: { introduction: 'We kindly request your prompt response to confirm your attendance at our upcoming event. Alongside your RSVP, please take a moment to extend your warm regards and best wishes.', imageId: 'mountain', wishes: sampleWishes.map(([name, dateLabel, message], index) => ({ id: `wish-${index + 1}`, name, dateLabel, message })), pageSize: 7 },
    video: { posterId: 'feature-poster', source: { kind: 'youtube', value: 'https://www.youtube.com/embed/BNQj5Muhss4?autoplay=1&rel=0' } },
    gallery: { heading: 'Our Pre-wedding Celebration.', imageIds: Array.from({ length: 16 }, (_, i) => `gallery-${String(i + 1).padStart(2, '0')}`) },
    closing: { imageId: 'closing', blessing: 'It is a pleasure and honor for us, if you are willing to attend and give us your blessing.', names: 'BAYU - HILWA', credits: [
      { label: 'CREATED BY FLOAT LABS', url: 'https://floatlabs.id/' },
      { label: '+62 838-5135-0939', url: 'https://wa.me/6283851350939' },
      { label: 'FLOATLABS.ID', url: 'https://instagram.com/floatlabs.id' },
      { label: 'FLOATLABS.ID', url: 'https://floatlabs.id' },
    ] },
    navigationImageId: 'menu',
  },
}
