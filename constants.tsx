import type { Item } from './types';

export const ALL_ITEMS: Item[] = [
  // Animals
  { name: 'Cow', emoji: '🐄', soundFrequency: 180, color: 'bg-sky-200', textColor: 'text-sky-800' },
  { name: 'Pig', emoji: '🐖', soundFrequency: 320, color: 'bg-pink-200', textColor: 'text-pink-800' },
  { name: 'Dog', emoji: '🐕', soundFrequency: 250, color: 'bg-amber-200', textColor: 'text-amber-800' },
  { name: 'Cat', emoji: '🐈', soundFrequency: 440, color: 'bg-slate-300', textColor: 'text-slate-800' },
  { name: 'Sheep', emoji: '🐑', soundFrequency: 380, color: 'bg-lime-200', textColor: 'text-lime-800' },
  { name: 'Lion', emoji: '🦁', soundFrequency: 200, color: 'bg-orange-300', textColor: 'text-orange-900' },
  { name: 'Monkey', emoji: '🐒', soundFrequency: 460, color: 'bg-yellow-400', textColor: 'text-yellow-900' },
  { name: 'Elephant', emoji: '🐘', soundFrequency: 140, color: 'bg-gray-400', textColor: 'text-gray-900' },
  { name: 'Giraffe', emoji: '🦒', soundFrequency: 230, color: 'bg-yellow-300', textColor: 'text-yellow-800' },
  
  // Fruits
  { name: 'Apple', emoji: '🍎', soundFrequency: 400, color: 'bg-red-200', textColor: 'text-red-800' },
  { name: 'Banana', emoji: '🍌', soundFrequency: 420, color: 'bg-yellow-200', textColor: 'text-yellow-800' },
  { name: 'Strawberry', emoji: '🍓', soundFrequency: 450, color: 'bg-red-300', textColor: 'text-red-900' },
  { name: 'Orange', emoji: '🍊', soundFrequency: 480, color: 'bg-orange-200', textColor: 'text-orange-800' },
  { name: 'Grapes', emoji: '🍇', soundFrequency: 500, color: 'bg-purple-200', textColor: 'text-purple-800' },

  // Vegetables
  { name: 'Carrot', emoji: '🥕', soundFrequency: 300, color: 'bg-orange-300', textColor: 'text-orange-900' },
  { name: 'Broccoli', emoji: '🥦', soundFrequency: 330, color: 'bg-green-200', textColor: 'text-green-800' },
  { name: 'Tomato', emoji: '🍅', soundFrequency: 350, color: 'bg-red-400', textColor: 'text-red-900' },
  { name: 'Potato', emoji: '🥔', soundFrequency: 280, color: 'bg-yellow-400', textColor: 'text-yellow-900' },
  { name: 'Bell Pepper', emoji: '🫑', soundFrequency: 370, color: 'bg-green-300', textColor: 'text-green-900' },

  // Transport
  { name: 'Car', emoji: '🚗', soundFrequency: 200, color: 'bg-blue-200', textColor: 'text-blue-800' },
  { name: 'Bus', emoji: '🚌', soundFrequency: 150, color: 'bg-yellow-300', textColor: 'text-yellow-900' },
  { name: 'Airplane', emoji: '✈️', soundFrequency: 600, color: 'bg-gray-200', textColor: 'text-gray-800' },
  { name: 'Train', emoji: '🚂', soundFrequency: 220, color: 'bg-red-300', textColor: 'text-red-800' },
  { name: 'Boat', emoji: '⛵️', soundFrequency: 340, color: 'bg-cyan-200', textColor: 'text-cyan-800' },
  { name: 'Rocket', emoji: '🚀', soundFrequency: 650, color: 'bg-slate-500', textColor: 'text-slate-100' },

  // Nature
  { name: 'Sun', emoji: '☀️', soundFrequency: 550, color: 'bg-yellow-200', textColor: 'text-yellow-800' },
  { name: 'Star', emoji: '⭐', soundFrequency: 700, color: 'bg-yellow-300', textColor: 'text-yellow-900' },
  { name: 'Flower', emoji: '🌻', soundFrequency: 520, color: 'bg-green-200', textColor: 'text-green-800' },
  { name: 'Tree', emoji: '🌳', soundFrequency: 160, color: 'bg-lime-300', textColor: 'text-lime-900' },

  // Objects
  { name: 'Ball', emoji: '⚽️', soundFrequency: 310, color: 'bg-gray-200', textColor: 'text-gray-800' },
  { name: 'Balloon', emoji: '🎈', soundFrequency: 470, color: 'bg-red-300', textColor: 'text-red-900' },
  { name: 'Gift', emoji: '🎁', soundFrequency: 530, color: 'bg-teal-200', textColor: 'text-teal-800' },
  { name: 'Book', emoji: '📚', soundFrequency: 270, color: 'bg-blue-300', textColor: 'text-blue-900' },

  // Instruments
  { name: 'Guitar', emoji: '🎸', soundFrequency: 260, color: 'bg-amber-300', textColor: 'text-amber-900' },
  { name: 'Piano', emoji: '🎹', soundFrequency: 490, color: 'bg-gray-300', textColor: 'text-gray-900' },
  { name: 'Drum', emoji: '🥁', soundFrequency: 190, color: 'bg-cyan-300', textColor: 'text-cyan-900' },
];

export const translations: Record<string, Record<string, string>> = {
  en: {
    startGame: 'Tap to Start!',
    Cow: 'Cow', Pig: 'Pig', Dog: 'Dog', Cat: 'Cat', Sheep: 'Sheep', Lion: 'Lion', Monkey: 'Monkey', Elephant: 'Elephant', Giraffe: 'Giraffe',
    Apple: 'Apple', Banana: 'Banana', Strawberry: 'Strawberry', Orange: 'Orange', Grapes: 'Grapes',
    Carrot: 'Carrot', Broccoli: 'Broccoli', Tomato: 'Tomato', Potato: 'Potato', 'Bell Pepper': 'Bell Pepper',
    Car: 'Car', Bus: 'Bus', Airplane: 'Airplane', Train: 'Train', Boat: 'Boat', Rocket: 'Rocket',
    Sun: 'Sun', Star: 'Star', Flower: 'Flower', Tree: 'Tree',
    Ball: 'Ball', Balloon: 'Balloon', Gift: 'Gift', Book: 'Book',
    Guitar: 'Guitar', Piano: 'Piano', Drum: 'Drum',
  },
  lv: {
    startGame: 'Pieskaries, lai sāktu!',
    Cow: 'Govs', Pig: 'Cūka', Dog: 'Suns', Cat: 'Kaķis', Sheep: 'Aita', Lion: 'Lauva', Monkey: 'Pērtiķis', Elephant: 'Zilonis', Giraffe: 'Žirafe',
    Apple: 'Ābols', Banana: 'Banāns', Strawberry: 'Zemene', Orange: 'Apelsīns', Grapes: 'Vīnogas',
    Carrot: 'Burkāns', Broccoli: 'Brokolis', Tomato: 'Tomāts', Potato: 'Kartupelis', 'Bell Pepper': 'Paprika',
    Car: 'Mašīna', Bus: 'Autobuss', Airplane: 'Lidmašīna', Train: 'Vilciens', Boat: 'Laiva', Rocket: 'Raķete',
    Sun: 'Saule', Star: 'Zvaigzne', Flower: 'Puķe', Tree: 'Koks',
    Ball: 'Bumba', Balloon: 'Balons', Gift: 'Dāvana', Book: 'Grāmata',
    Guitar: 'Ģitāra', Piano: 'Klavieres', Drum: 'Bungas',
  },
  es: {
    startGame: '¡Toca para empezar!',
    Cow: 'Vaca', Pig: 'Cerdo', Dog: 'Perro', Cat: 'Gato', Sheep: 'Oveja', Lion: 'León', Monkey: 'Mono', Elephant: 'Elefante', Giraffe: 'Jirafa',
    Apple: 'Manzana', Banana: 'Plátano', Strawberry: 'Fresa', Orange: 'Naranja', Grapes: 'Uvas',
    Carrot: 'Zanahoria', Broccoli: 'Brócoli', Tomato: 'Tomate', Potato: 'Patata', 'Bell Pepper': 'Pimiento',
    Car: 'Coche', Bus: 'Autobús', Airplane: 'Avión', Train: 'Tren', Boat: 'Barco', Rocket: 'Cohete',
    Sun: 'Sol', Star: 'Estrella', Flower: 'Flor', Tree: 'Árbol',
    Ball: 'Pelota', Balloon: 'Globo', Gift: 'Regalo', Book: 'Libro',
    Guitar: 'Guitarra', Piano: 'Piano', Drum: 'Tambor',
  },
  fr: {
    startGame: 'Touchez pour commencer !',
    Cow: 'Vache', Pig: 'Cochon', Dog: 'Chien', Cat: 'Chat', Sheep: 'Mouton', Lion: 'Lion', Monkey: 'Singe', Elephant: 'Éléphant', Giraffe: 'Girafe',
    Apple: 'Pomme', Banana: 'Banane', Strawberry: 'Fraise', Orange: 'Orange', Grapes: 'Raisins',
    Carrot: 'Carotte', Broccoli: 'Brocoli', Tomato: 'Tomate', 'Bell Pepper': 'Poivron', Potato: 'Pomme de terre',
    Car: 'Voiture', Bus: 'Bus', Airplane: 'Avion', Train: 'Train', Boat: 'Bateau', Rocket: 'Fusée',
    Sun: 'Soleil', Star: 'Étoile', Flower: 'Fleur', Tree: 'Arbre',
    Ball: 'Balle', Balloon: 'Ballon', Gift: 'Cadeau', Book: 'Livre',
    Guitar: 'Guitare', Piano: 'Piano', Drum: 'Tambour',
  },
  de: {
    startGame: 'Tippen zum Starten!',
    Cow: 'Kuh', Pig: 'Schwein', Dog: 'Hund', Cat: 'Katze', Sheep: 'Schaf', Lion: 'Löwe', Monkey: 'Affe', Elephant: 'Elefant', Giraffe: 'Giraffe',
    Apple: 'Apfel', Banana: 'Banane', Strawberry: 'Erdbeere', Orange: 'Orange', Grapes: 'Trauben',
    Carrot: 'Karotte', Broccoli: 'Brokkoli', Tomato: 'Tomate', Potato: 'Kartoffel', 'Bell Pepper': 'Paprika',
    Car: 'Auto', Bus: 'Bus', Airplane: 'Flugzeug', Train: 'Zug', Boat: 'Boot', Rocket: 'Rakete',
    Sun: 'Sonne', Star: 'Stern', Flower: 'Blume', Tree: 'Baum',
    Ball: 'Ball', Balloon: 'Luftballon', Gift: 'Geschenk', Book: 'Buch',
    Guitar: 'Gitarre', Piano: 'Klavier', Drum: 'Trommel',
  }
};

export const availableLanguages = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'lv', flag: '🇱🇻' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'de', flag: '🇩🇪' },
];