/*
 * Kartu pengetahuan ikan untuk Catch Log (klik ikan yang sudah tertangkap → muncul penjelasannya).
 * Kunci = id spesies di src/ocean/species.js. Ikan baru tanpa entri di sini tetap muncul di Catch Log,
 * hanya tanpa kartu fakta.
 *   sci    : nama ilmiah (spesies atau famili)
 *   local  : nama dalam bahasa Indonesia
 *   size   : ukuran dewasa
 *   habitat: tempat hidup
 *   facts  : 2–3 fakta singkat
 */
export const FISH_FACTS = {
  clown: {
    sci: 'Amphiprion ocellaris',
    local: 'Ikan badut',
    size: 'Up to 11 cm',
    habitat: 'Indo-Pacific coral reefs, including Indonesia',
    facts: [
      'Lives inside sea anemones. A slimy mucus coat keeps it from getting stung, and in return it chases away fish that eat anemones.',
      'Every clownfish hatches male. When the group’s female dies, the biggest male turns into a female and takes her place.',
    ],
  },
  tang: {
    sci: 'Paracanthurus hepatus',
    local: 'Ikan botana biru',
    size: 'Up to 31 cm',
    habitat: 'Indo-Pacific coral reefs',
    facts: [
      'It’s a surgeonfish: a scalpel-sharp spine hides near its tail and flicks out when it feels threatened.',
      'Grazes on algae all day, which stops algae from smothering the coral reef.',
    ],
  },
  yellow: {
    sci: 'Zebrasoma flavescens',
    local: 'Ikan botana kuning',
    size: 'Up to 20 cm',
    habitat: 'Pacific reefs, especially around Hawaii',
    facts: [
      'Also a surgeonfish, with a white spine near the tail used for defense.',
      'At night its bright yellow fades and a pale stripe appears along its side. The full colour comes back in the morning.',
    ],
  },
  angel: {
    sci: 'Family Pomacanthidae',
    local: 'Ikan angel laut',
    size: 'Most species 10–60 cm',
    habitat: 'Shallow tropical reefs worldwide',
    facts: [
      'Has a strong spine on each gill cover, the easiest way to tell it apart from a butterflyfish.',
      'Many species look completely different when young and change their colour pattern as they grow up.',
    ],
  },
  butterfly: {
    sci: 'Family Chaetodontidae',
    local: 'Ikan kepe-kepe',
    size: 'Most species 12–22 cm',
    habitat: 'Tropical reefs, especially the Indo-Pacific',
    facts: [
      'Many have a dark “eye spot” near the tail that tricks predators into attacking the wrong end.',
      'Often swims in pairs that stay together for years.',
    ],
  },
  parrot: {
    sci: 'Family Scaridae',
    local: 'Ikan kakatua',
    size: 'Usually 30–50 cm',
    habitat: 'Tropical reefs worldwide',
    facts: [
      'Its teeth are fused into a beak that scrapes algae off coral, which is how it got its name.',
      'It grinds up bits of coral while eating and poops them out as fine sand. Much of the white sand on tropical beaches comes from parrotfish.',
      'Some species sleep inside a bubble of mucus, like a see-through sleeping bag.',
    ],
  },
  puffer: {
    sci: 'Family Tetraodontidae',
    local: 'Ikan buntal',
    size: 'A few cm up to about 60 cm',
    habitat: 'Warm seas worldwide',
    facts: [
      'When threatened, it gulps water and inflates into a ball several times its normal size.',
      'Many carry tetrodotoxin, one of the deadliest natural poisons. Never eat one unless it was prepared by a licensed chef.',
    ],
  },
  sardine: {
    sci: 'Family Engraulidae',
    local: 'Ikan teri',
    size: 'Usually under 15 cm',
    habitat: 'Coastal seas worldwide',
    facts: [
      'Swims in tight schools of thousands that move as one to confuse predators.',
      'Filters plankton from the water, and is a key food for seabirds, tuna and dolphins. For people too: think sambal teri!',
    ],
  },
};
