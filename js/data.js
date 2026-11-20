/* Rumi's Alphabet Stage - all learning content lives here. */

const ALPHABET = [
  { letter: 'A', emoji: '🍎', word: 'Apple' },
  { letter: 'B', emoji: '⚽', word: 'Ball' },
  { letter: 'C', emoji: '🐱', word: 'Cat' },
  { letter: 'D', emoji: '🐶', word: 'Dog' },
  { letter: 'E', emoji: '🐘', word: 'Elephant' },
  { letter: 'F', emoji: '🐟', word: 'Fish' },
  { letter: 'G', emoji: '🎸', word: 'Guitar' },
  { letter: 'H', emoji: '🏠', word: 'House' },
  { letter: 'I', emoji: '🍦', word: 'Ice cream' },
  { letter: 'J', emoji: '🧃', word: 'Juice' },
  { letter: 'K', emoji: '🪁', word: 'Kite' },
  { letter: 'L', emoji: '🦁', word: 'Lion' },
  { letter: 'M', emoji: '🌙', word: 'Moon' },
  { letter: 'N', emoji: '🍜', word: 'Noodles' },
  { letter: 'O', emoji: '🍊', word: 'Orange' },
  { letter: 'P', emoji: '🐧', word: 'Penguin' },
  { letter: 'Q', emoji: '👑', word: 'Queen' },
  { letter: 'R', emoji: '🌈', word: 'Rainbow' },
  { letter: 'S', emoji: '⭐', word: 'Star' },
  { letter: 'T', emoji: '🧸', word: 'Teddy' },
  { letter: 'U', emoji: '☂️', word: 'Umbrella' },
  { letter: 'V', emoji: '🚐', word: 'Van' },
  { letter: 'W', emoji: '🍉', word: 'Watermelon' },
  { letter: 'X', emoji: '🎼', word: 'Xylophone' },
  { letter: 'Y', emoji: '🪀', word: 'Yoyo' },
  { letter: 'Z', emoji: '🦓', word: 'Zebra' }
];

const TILE_COLORS = ['#ff5fb8', '#7b5cff', '#21c9c4', '#ffb02e', '#ff7a59', '#4fa8ff'];

const COLORS = [
  { name: 'Red', hex: '#ff4d5e', sparkle: '#ffd0d5' },
  { name: 'Orange', hex: '#ff9f2e', sparkle: '#ffe6bd' },
  { name: 'Yellow', hex: '#ffd93d', sparkle: '#fff6bd' },
  { name: 'Green', hex: '#3fd07a', sparkle: '#c9f7d9' },
  { name: 'Blue', hex: '#3d9bff', sparkle: '#c9e4ff' },
  { name: 'Purple', hex: '#9a5cff', sparkle: '#e1cfff' },
  { name: 'Pink', hex: '#ff6fb5', sparkle: '#ffd3eb' }
];

const WORDS = [
  { word: 'cat', emoji: '🐱' },
  { word: 'dog', emoji: '🐶' },
  { word: 'sun', emoji: '☀️' },
  { word: 'hat', emoji: '🎩' },
  { word: 'ball', emoji: '⚽' },
  { word: 'fish', emoji: '🐟' },
  { word: 'star', emoji: '⭐' },
  { word: 'moon', emoji: '🌙' },
  { word: 'car', emoji: '🚗' },
  { word: 'tree', emoji: '🌳' },
  { word: 'cake', emoji: '🍰' },
  { word: 'bird', emoji: '🐦' },
  { word: 'book', emoji: '📕' },
  { word: 'duck', emoji: '🦆' },
  { word: 'frog', emoji: '🐸' },
  { word: 'bee', emoji: '🐝' }
];

const SPELL_WORDS = [
  { word: 'cat', emoji: '🐱' },
  { word: 'dog', emoji: '🐶' },
  { word: 'sun', emoji: '☀️' },
  { word: 'hat', emoji: '🎩' },
  { word: 'pen', emoji: '🖊️' },
  { word: 'bus', emoji: '🚌' },
  { word: 'cup', emoji: '🥤' },
  { word: 'pig', emoji: '🐷' },
  { word: 'bed', emoji: '🛏️' },
  { word: 'fox', emoji: '🦊' }
];

const PRAISE = [
  'Amazing!', 'Super star!', 'You got it!', 'Brilliant!', 'Way to shine!',
  'Great job!', 'Rumi is so proud!', 'Wow!', 'Perfect!', 'You did it!'
];

const LETTER_BANK = 'abcdefghijklmnopqrstuvwxyz'.split('');
