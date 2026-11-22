// Everything personal lives here. Swap placeholders for the real thing.
export const COUPLE = { bride: 'Omolade', groom: 'Tomiwa', monogram: 'O & T' }
export const DATE_ISO = '2027-02-27T13:00:00+01:00'
export const DATE_TEXT = 'Saturday, 27 February 2027'
export const VENUE = { name: 'Funplex Resort', area: 'CMD Road, Magodo, Lagos', note: 'Directions and parking details will be shared closer to the day.' }

export const ORDER = [
  { time: '1:00 PM', title: 'White wedding', note: 'The vows.' },
  { time: '2:30 PM', title: 'Mocktails, meet and greet', note: 'Say hello, take pictures, play games, find your table.' },
  { time: '3:30 PM', title: 'Reception', note: 'Food, toasts, dancing.' },
  { time: '7:00 PM', title: 'After party', note: 'Shoes off.' }
]

// "A peep into our life". src: null shows a placeholder until the real photo arrives.
export const PHOTOS = [
  { src: 'media/life01.jpg', caption: 'May 2025. One monument, two people, and the start of a very full camera roll.' },
  { src: 'media/life02.jpg', caption: 'Sunshine, matching smiles, and nowhere else to be.' },
  { src: 'media/life03.jpg', caption: 'By the sea, we made a heart with our hands and meant it.' },
  { src: 'media/life04.jpg', caption: 'Dressed up, sitting pretty, standing tall.' },
  { src: 'media/life05.jpg', caption: 'An ordinary street, an ordinary day. With you, enough.' },
  { src: 'media/life06.jpg', caption: 'Still taking selfies. Still smiling like that.' },
  { src: 'media/life07.jpg', caption: 'Black and white, and holding on.' },
  { src: 'media/life08.jpg', caption: 'Late nights, good company, better company.' },
  { src: 'media/life09.jpg', caption: 'Cap, gown, and the proudest person in the frame.' },
  { src: 'media/life10.jpg', caption: 'And then, he knelt.' }
]
export const ENTRANCE_PHOTO = 'media/entrance.jpg'
export const PROPOSAL_VIDEO = 'media/proposal.mp4'
export const PROPOSAL_POSTER = 'media/poster.jpg'

export const GIFTS = [
  { id: 'honeymoon', name: 'Our honeymoon', price: 4000000, note: 'Flights, a quiet beach and a few slow mornings. Send us off well.', model: 'honeymoon' },
  { id: 'inverter', name: 'Lithium-ion inverter', price: 3000000, note: 'Steady light, whatever the grid decides.', model: 'inverter' },
  { id: 'tv70', name: '70-inch TV', price: 800000, note: 'For movie nights and the big matches.', model: 'tv' },
  { id: 'fridge', name: 'Double-door refrigerator', price: 700000, note: 'Room for every pot of stew.', model: 'fridge' },
  { id: 'oven', name: 'Oven', price: 300000, note: 'Cakes, chin chin and Sunday roasts.', model: 'oven' },
  { id: 'cookware', name: 'Cookware set', price: 300000, note: 'The pots our first jollof will come from.', model: 'cookware' },
  { id: 'microwave', name: 'Microwave', price: 150000, note: 'For the leftovers. There will be leftovers.', model: 'microwave' }
]
export const SHARE_URL = 'https://claude.ai/artifact/KBEjp2zYCvMq9yiBFx3kiW'
export const naira = n => '₦' + Math.round(n || 0).toLocaleString('en-NG')

// Full-bleed background photo (register section)
export const BG_PHOTO = 'media/bg.jpg'
