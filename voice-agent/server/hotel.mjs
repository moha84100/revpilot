export const hotel = {
  id: 'grand-hotel-orange',
  name: 'Grand Hôtel Démo',
  city: 'Orange',
  address: '12 place de la République, 84100 Orange',
  phone: '+33 4 90 00 00 00',
  email: 'reservation@grandhotel-demo.fr',
  checkIn: '15:00',
  checkOut: '11:00',
  receptionHours: '7 h à 23 h',
  languages: ['fr', 'en', 'es'],
  policies: {
    cancellation: 'Annulation gratuite jusqu’à 18 h la veille de l’arrivée.',
    children: 'Les enfants sont les bienvenus. Un lit bébé peut être ajouté sur demande.',
    pets: 'Les animaux de moins de 10 kg sont acceptés avec un supplément de 12 € par nuit.',
  },
  options: [
    { id: 'breakfast', name: 'Petit-déjeuner buffet', price: 18, unit: 'par personne et par jour' },
    { id: 'parking', name: 'Parking sécurisé', price: 14, unit: 'par nuit' },
    { id: 'late-checkout', name: 'Départ tardif à 14 h', price: 35, unit: 'par séjour' },
  ],
  roomTypes: [
    { id: 'classic', name: 'Chambre Classique', capacity: 2, total: 28, baseRate: 109 },
    { id: 'superior', name: 'Chambre Supérieure', capacity: 3, total: 16, baseRate: 139 },
    { id: 'suite', name: 'Suite Junior', capacity: 4, total: 4, baseRate: 209 },
  ],
}

export function publicHotelConfig() {
  return {
    ...hotel,
    integration: {
      pms: process.env.PMS_PROVIDER || 'Démo RevPilot',
      telephony: process.env.TWILIO_ACCOUNT_SID ? 'Twilio configuré' : 'Mode simulation',
      ai: process.env.OPENAI_API_KEY ? 'OpenAI Realtime configuré' : 'Mode simulation',
    },
  }
}
