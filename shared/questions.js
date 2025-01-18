const QUESTIONS = [
  {id: '1', text: 'Ad Soyad', type: 'text'},
  {id: '2', text: 'E-mail', type: 'text'},
  {id: '3', text: 'Telefon Numarası', type: 'text'},
  {
    id: '4',
    text: 'Yaş Aralığı',
    type: 'multiple_choice',
    options: ['0-18', '19-25', '26-35', '36+'],
  },
  {
    id: '5',
    text: 'Eğitim Durumu',
    type: 'multiple_choice',
    options: ['Lise', 'Önlisans', 'Lisans', 'Yüksek Lisans', 'Doktora'],
  },
];

module.exports = { QUESTIONS };