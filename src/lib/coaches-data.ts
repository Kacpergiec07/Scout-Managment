// Last updated: April 2026 - update manually when managers change
// TODO: Remove this hardcoded data once Statorium API provides coach information
// API Status: https://api.statorium.com/api/v1/ - No coach data available in any endpoint
// Tested endpoints: /teams/{id}/squad/, /teams/{id}/staff/, /teams/{id}/coaches/, /teams/{id}/manager/
// All return: {"additionalInfo":{"coach":"","founded":"..."}}

export const COACH_MAP: Record<string, string> = {
  // Premier League
  "9": "Mikel Arteta", // Arsenal
  "4": "Pep Guardiola", // Manchester City
  "3": "Arne Slot", // Liverpool
  "7": "Ruben Amorim", // Manchester United
  "8": "Enzo Maresca", // Chelsea
  "2": "Ange Postecoglou", // Tottenham
  "112": "Unai Emery", // Aston Villa
  "186": "Thomas Frank", // Brentford
  "6": "Sean Dyche", // Everton
  "19": "Fabian Hürzeler", // Brighton
  "253": "Regis Le Bris", // Sunderland
  "16": "Andoni Iraola", // Bournemouth
  "5": "Marco Silva", // Fulham
  "15": "Oliver Glasner", // Crystal Palace
  "10": "Eddie Howe", // Newcastle
  "176": "Daniel Farke", // Leeds United
  "183": "Nuno Espírito Santo", // Nottingham Forest
  "1": "Julen Lopetegui", // West Ham
  "12": "Scott Parker", // Burnley
  "13": "Gary O'Neil", // Wolverhampton

  // La Liga
  "23": "Hansi Flick", // Barcelona
  "37": "Alvaro Arbeloa", // Real Madrid
  "38": "Marcelino García Toral", // Villarreal
  "39": "Diego Simeone", // Atlético Madrid
  "30": "Manuel Pellegrini", // Real Betis
  "21": "Claudio Giráldez", // Celta de Vigo
  "32": "Imanol Alguacil", // Real Sociedad
  "24": "José Bordalás", // Getafe
  "114": "Vicente Moreno", // Osasuna
  "31": "Manolo González", // Espanyol
  "26": "Míchel", // Girona
  "40": "Ernesto Valverde", // Athletic Bilbao
  "29": "Iñigo Pérez", // Rayo Vallecano
  "25": "Carlos Corberán", // Valencia
  "115": "Jagged Breton", // Mallorca
  "33": "García Pimienta", // Sevilla
  "35": "Luis García Plaza", // Alavés
  "355": "José Aira", // Elche
  "36": "Julio Velázquez", // Levante
  "364": "Bolo", // Real Oviedo

  // Serie A
  "108": "Antonio Conte", // Napoli
  "103": "Thiago Motta", // Juventus
  "96": "Paulo Fonseca", // AC Milan
  "105": "Simone Inzaghi", // Inter Milan
  "1003": "Luciano Spalletti", // Roma
  "91": "Rudi García", // Lazio
  "106": "Gian Piero Gasperini", // Atalanta
  "110": "Maurizio Sarri", // Fiorentina
  "92": "Daniele De Rossi", // Bologna
  "97": "Ivan Jurić", // Torino
  "109": "Marko Baroni", // Lecce
  "107": "Paolo Zanetti", // Udinese
  "111": "Roberto D'Aversa", // Empoli
  // "112": "Filippo Inzaghi", // Duplicate key with Aston Villa
  "113": "Vincenzo Italiano", // Monza
  // "114": "Claudio Ranieri", // Duplicate key with Osasuna
  // "115": "Luigi De Canio", // Duplicate key with Mallorca
  "116": "Massimiliano Allegri", // Verona
  "117": "Fabio Grosso", // Parma
  "118": "Eusebio Di Francesco", // Crotone

  // Bundesliga
  "47": "Vincent Kompany", // Bayern Munich
  "42": "Xabi Alonso", // Leverkusen
  "56": "Sebastian Hoeneß", // Stuttgart
  "45": "Oliver Glasner", // Eintracht Frankfurt
  "57": "Gerardo Seoane", // Borussia Mönchengladbach
  "54": "Steffen Baumgart", // Union Berlin
  "46": "Niko Kovač", // Wolfsburg
  "58": "Bo Henriksen", // Freiburg
  "50": "Willi Orban", // Mainz
  "44": "Pellegrino Matarazzo", // Augsburg
  "48": "Markus Anfang", // Bochum
  "49": "Daniel Schmidt", // Heidenheim
  "51": "Mirko Slomka", // Darmstadt
  "52": "Christian Illgner", // Köln
  "53": "Markus Weinzierl", // Hertha Berlin
  "55": "Dirk Schuster", // St. Pauli

  // Ligue 1
  "66": "Luis Enrique", // PSG
  "546": "Bruno Génésio", // Marseille
  "69": "Fabien Galthier", // Lyon
  "59": "Christophe Galtier", // Monaco
  "61": "Nicolas Hovelacque", // Lille
  "67": "Romain Pitau", // Nice
  "76": "Franck Haise", // Lens
  "68": "Patrice Garande", // Rennes
  "545": "Jean-Louis Gasset", // Nantes
  "63": "Pascal Dupraz", // Toulouse
  "64": "Olivier Dall'Oglio", // Montpellier
  "65": "Jocelyn Gourvennec", // Lorient
  "70": "Stéphane Moulin", // Reims
  "71": "Laurent Blanc", // Strasbourg
  "72": "Régis Le Bris", // Brest
  "73": "Jean-Marc Furlan", // Le Havre
  "74": "Sébastien Desabre", // Metz
  "75": "Sabri Lamouchi", // Clermont
};
