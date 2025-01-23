const QUESTIONS = [
  {id: '1', text: 'Full Name', type: 'text'},
  {id: '2', text: 'E-mail', type: 'text'},
  {id: '3', text: 'Phone Number', type: 'text'},
  {
    id: '4',
    text: 'Age Range',
    type: 'multiple_choice',
    options: ['0-18', '19-25', '26-35', '36+'],
  },
  {
    id: '5',
    text: 'Education Level',
    type: 'multiple_choice',
    options: [
      'High School',
      'Associate Degree',
      "Bachelor's Degree",
      "Master's Degree",
      'Doctorate',
    ],
  },
];

module.exports = {QUESTIONS};
