
const leagues = {
  "1": { // Premier League
    name: "Premier League",
    teams: [
      { id: "pl-1", name: "Liverpool FC", logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg", points: 75, players: ["Mohamed Salah", "Virgil van Dijk", "Alexis Mac Allister", "Luis Díaz", "Trent Alexander-Arnold", "Alisson Becker", "Darwin Núñez", "Dominik Szoboszlai", "Cody Gakpo", "Andrew Robertson", "Ibrahima Konaté"] },
      { id: "pl-2", name: "Manchester City", logo: "https://upload.wikimedia.org/wikipedia/en/eb/eb/Manchester_City_FC_badge.svg", points: 73, players: ["Erling Haaland", "Kevin De Bruyne", "Rodri", "Phil Foden", "Bernardo Silva", "Ederson", "Kyle Walker", "Ruben Dias", "John Stones", "Jack Grealish", "Jeremy Doku"] },
      { id: "pl-3", name: "Arsenal FC", logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg", points: 71, players: ["Martin Ødegaard", "Bukayo Saka", "Declan Rice", "William Saliba", "Gabriel Magalhães", "Kai Havertz", "Ben White", "David Raya", "Gabriel Martinelli", "Leandro Trossard", "Jurrien Timber"] },
      { id: "pl-4", name: "Aston Villa", logo: "https://upload.wikimedia.org/wikipedia/en/9/9f/Aston_Villa_logo.svg", points: 60, players: ["Ollie Watkins", "Emiliano Martínez", "Douglas Luiz", "Leon Bailey", "John McGinn", "Ezri Konsa", "Pau Torres", "Lucas Digne", "Youri Tielemans", "Moussa Diaby", "Boubacar Kamara"] },
      { id: "pl-5", name: "Chelsea FC", logo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg", points: 58, players: ["Cole Palmer", "Enzo Fernández", "Nicolas Jackson", "Reece James", "Moisés Caicedo", "Christopher Nkunku", "Levi Colwill", "Robert Sánchez", "Conor Gallagher", "Malo Gusto", "Axel Disasi"] },
      { id: "pl-6", name: "Newcastle United", logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg", points: 56, players: ["Alexander Isak", "Bruno Guimarães", "Anthony Gordon", "Sandro Tonali", "Kieran Trippier", "Nick Pope", "Sven Botman", "Fabian Schär", "Joelinton", "Harvey Barnes", "Callum Wilson"] },
      { id: "pl-7", name: "Tottenham Hotspur", logo: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg", points: 54, players: ["Son Heung-min", "James Maddison", "Cristian Romero", "Micky van de Ven", "Guglielmo Vicario", "Pedro Porro", "Dejan Kulusevski", "Richarlison", "Brennan Johnson", "Yves Bissouma", "Pape Matar Sarr"] },
      { id: "pl-8", name: "Manchester United", logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg", points: 52, players: ["Bruno Fernandes", "Marcus Rashford", "Alejandro Garnacho", "Kobbie Mainoo", "Rasmus Højlund", "Lisandro Martínez", "Andre Onana", "Diogo Dalot", "Luke Shaw", "Casemiro", "Mason Mount"] },
      { id: "pl-9", name: "Brighton & Hove Albion", logo: "https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg", points: 48, players: ["Kaoru Mitoma", "Evan Ferguson", "Joao Pedro", "Pascal Groß", "Lewis Dunk", "Pervis Estupiñán", "Billy Gilmour", "Bart Verbruggen", "Danny Welbeck", "Jan Paul van Hecke", "Simon Adingra"] },
      { id: "pl-10", name: "West Ham United", logo: "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg", points: 45, players: ["Jarrod Bowen", "Mohammed Kudus", "Lucas Paquetá", "Edson Álvarez", "Tomas Soucek", "Alphonse Areola", "Emerson", "Kurt Zouma", "James Ward-Prowse", "Konstantinos Mavropanos", "Michail Antonio"] }
    ]
  },
  "2": { // La Liga
    name: "La Liga",
    teams: [
      { id: "ll-1", name: "Real Madrid", logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg", points: 78, players: ["Jude Bellingham", "Vinícius Júnior", "Kylian Mbappé", "Rodrygo", "Federico Valverde", "Thibaut Courtois", "Antonio Rüdiger", "Luka Modrić", "Eduardo Camavinga", "Aurélien Tchouaméni", "Dani Carvajal"] },
      { id: "ll-2", name: "FC Barcelona", logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona.svg", points: 70, players: ["Robert Lewandowski", "Lamine Yamal", "Pedri", "Raphinha", "Gavi", "Frenkie de Jong", "Marc-André ter Stegen", "Ronald Araújo", "Jules Koundé", "Alejandro Balde", "İlkay Gündoğan"] },
      { id: "ll-3", name: "Atletico Madrid", logo: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg", points: 67, players: ["Antoine Griezmann", "Julián Álvarez", "Jan Oblak", "Koke", "Rodrigo De Paul", "Marcos Llorente", "José María Giménez", "Samuel Lino", "Alexander Sørloth", "Axel Witsel", "Robin Le Normand"] },
      { id: "ll-4", name: "Girona FC", logo: "https://upload.wikimedia.org/wikipedia/en/9/94/Girona_FC_logo.svg", points: 65, players: ["Daley Blind", "Viktor Tsygankov", "Yangel Herrera", "Miguel Gutiérrez", "Ivan Martín", "Paulo Gazzaniga", "Cristhian Stuani", "Bryan Gil", "Donny van de Beek", "Arnaut Danjuma", "Oriol Romeu"] },
      { id: "ll-5", name: "Athletic Bilbao", logo: "https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg", points: 62, players: ["Nico Williams", "Iñaki Williams", "Oihan Sancet", "Unai Simón", "Álvaro Djaló", "Dani Vivian", "Aitor Paredes", "Gorka Guruzeta", "Iñigo Ruiz de Galarreta", "Beñat Prados", "Yuri Berchiche"] },
      { id: "ll-6", name: "Real Sociedad", logo: "https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg", points: 58, players: ["Mikel Oyarzabal", "Martin Zubimendi", "Takefusa Kubo", "Brais Méndez", "Álex Remiro", "Nayef Aguerd", "Jon Aramburu", "Sergio Gómez", "Luka Sučić", "Sheraldo Becker", "Hamari Traoré"] },
      { id: "ll-7", name: "Real Betis", logo: "https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg", points: 55, players: ["Isco", "Vitor Roque", "Giovani Lo Celso", "Abde Ezzalzouli", "Rui Silva", "Marc Bartra", "Diego Llorente", "Ricardo Rodriguez", "Johnny Cardoso", "Pablo Fornals", "Ezequiel Ávila"] },
      { id: "ll-8", name: "Villarreal CF", logo: "https://upload.wikimedia.org/wikipedia/en/7/70/Villarreal_CF_logo.svg", points: 52, players: ["Gerard Moreno", "Álex Baena", "Ayoze Pérez", "Nicolas Pépé", "Diego Conde", "Eric Bailly", "Raúl Albiol", "Dani Parejo", "Santi Comesaña", "Logan Costa", "Thierno Barry"] },
      { id: "ll-9", name: "Sevilla FC", logo: "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg", points: 45, players: ["Saúl Ñíguez", "Isaac Romero", "Dodi Lukebakio", "Loïc Badé", "Ørjan Nyland", "Valentín Barco", "Kike Salas", "Nemanja Gudelj", "Albert Sambi Lokonga", "Lucien Agoumé", "Djibril Sow"] },
      { id: "ll-10", name: "Valencia CF", logo: "https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg", points: 42, players: ["Giorgi Mamardashvili", "Pepelu", "Hugo Duro", "Diego López", "Cristhian Mosquera", "César Tárrega", "Thierry Correia", "José Gayà", "Javi Guerra", "Rafa Mir", "Luis Rioja"] }
    ]
  },
  "3": { // Serie A
    name: "Serie A",
    teams: [
      { id: "sa-1", name: "Inter Milan", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg", points: 82, players: ["Lautaro Martínez", "Nicolò Barella", "Marcus Thuram", "Alessandro Bastoni", "Hakan Çalhanoğlu", "Yann Sommer", "Benjamin Pavard", "Federico Dimarco", "Denzel Dumfries", "Davide Frattesi", "Mehdi Taremi"] },
      { id: "sa-2", name: "AC Milan", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg", points: 72, players: ["Rafael Leão", "Theo Hernández", "Christian Pulisic", "Alvaro Morata", "Mike Maignan", "Tijjani Reijnders", "Ruben Loftus-Cheek", "Fikayo Tomori", "Strahinja Pavlović", "Youssouf Fofana", "Samuel Chukwueze"] },
      { id: "sa-3", name: "Juventus", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg", points: 70, players: ["Dušan Vlahović", "Kenan Yıldız", "Teun Koopmeiners", "Douglas Luiz", "Michele Di Gregorio", "Gleison Bremer", "Danilo", "Nico González", "Khephren Thuram", "Manuel Locatelli", "Timothy Weah"] },
      { id: "sa-4", name: "Napoli", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Napoli_2021.svg", points: 68, players: ["Khvicha Kvaratskhelia", "Romelu Lukaku", "Scott McTominay", "Billy Gilmour", "Alex Meret", "Giovanni Di Lorenzo", "Alessandro Buongiorno", "Amir Rrahmani", "Frank Anguissa", "Stanislav Lobotka", "Mathias Olivera"] },
      { id: "sa-5", name: "AS Roma", logo: "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg", points: 64, players: ["Paulo Dybala", "Artem Dovbyk", "Matías Soulé", "Lorenzo Pellegrini", "Mile Svilar", "Evan Ndicka", "Gianluca Mancini", "Angeliño", "Manu Koné", "Bryan Cristante", "Leandro Paredes"] },
      { id: "sa-6", name: "Lazio", logo: "https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg", points: 61, players: ["Mattia Zaccagni", "Taty Castellanos", "Boulaye Dia", "Ivan Provedel", "Nuno Tavares", "Alessio Romagnoli", "Matteo Guendouzi", "Nicolò Rovella", "Tijjani Noslin", "Gustav Isaksen", "Manuel Lazzari"] },
      { id: "sa-7", name: "Atalanta", logo: "https://upload.wikimedia.org/wikipedia/en/6/66/Atalanta_BC.svg", points: 60, players: ["Ademola Lookman", "Charles De Ketelaere", "Mateo Retegui", "Marco Carnesecchi", "Isak Hien", "Berat Djimsiti", "Ederson", "Marten de Roon", "Raoul Bellanova", "Davide Zappacosta", "Mario Pašalić"] },
      { id: "sa-8", name: "Fiorentina", logo: "https://upload.wikimedia.org/wikipedia/commons/7/79/ACF_Fiorentina_2022_logo.svg", points: 55, players: ["Albert Guðmundsson", "Moise Kean", "David de Gea", "Lucas Beltrán", "Robin Gosens", "Lucas Martínez Quarta", "Dodo", "Edoardo Bove", "Danilo Cataldi", "Yacine Adli", "Andrea Colpani"] },
      { id: "sa-9", name: "Bologna", logo: "https://upload.wikimedia.org/wikipedia/en/0/08/Bologna_F.C._1909_logo.svg", points: 52, players: ["Riccardo Orsolini", "Thijs Dallinga", "Santiago Castro", "Łukasz Skorupski", "Sam Beukema", "Jhon Lucumí", "Stefan Posch", "Remo Freuler", "Michel Aebischer", "Dan Ndoye", "Giovanni Fabbian"] },
      { id: "sa-10", name: "Torino", logo: "https://upload.wikimedia.org/wikipedia/en/2/2e/Torino_FC_Logo.svg", points: 50, players: ["Duván Zapata", "Ché Adams", "Antonio Sanabria", "Vanja Milinković-Savić", "Saúl Coco", "Adam Masina", "Sebastian Walukiewicz", "Ivan Ilić", "Valentino Lazaro", "Samuele Ricci", "Borna Sosa"] }
    ]
  },
  "4": { // Bundesliga
    name: "Bundesliga",
    teams: [
      { id: "bl-1", name: "Bayer Leverkusen", logo: "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg", points: 80, players: ["Florian Wirtz", "Granit Xhaka", "Victor Boniface", "Alejandro Grimaldo", "Jeremie Frimpong", "Lukáš Hrádecký", "Jonathan Tah", "Edmond Tapsoba", "Piero Hincapié", "Aleix García", "Patrik Schick"] },
      { id: "bl-2", name: "Bayern Munich", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_München_logo_%282017%29.svg", points: 75, players: ["Harry Kane", "Jamal Musiala", "Leroy Sané", "Michael Olise", "Manuel Neuer", "Dayot Upamecano", "Kim Min-jae", "Joshua Kimmich", "Aleksandar Pavlović", "Joao Palhinha", "Thomas Müller"] },
      { id: "bl-3", name: "RB Leipzig", logo: "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg", points: 68, players: ["Xavi Simons", "Loïs Openda", "Benjamin Šeško", "Lutsharel Geertruida", "Péter Gulácsi", "Willi Orbán", "Castello Lukeba", "David Raum", "Amadou Haidara", "Nicolas Seiwald", "Arthur Vermeeren"] },
      { id: "bl-4", name: "Borussia Dortmund", logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg", points: 62, players: ["Julian Brandt", "Serhou Guirassy", "Gregor Kobel", "Nico Schlotterbeck", "Waldemar Anton", "Yan Couto", "Pascal Groß", "Marcel Sabitzer", "Karim Adeyemi", "Jamie Gittens", "Maximilian Beier"] },
      { id: "bl-5", name: "Stuttgart", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/VfB_Stuttgart_1893_Logo.svg", points: 60, players: ["Deniz Undav", "Ermedin Demirović", "Alexander Nübel", "Jeff Chabot", "Anrie Chase", "Maximilian Mittelstädt", "Atakan Karazor", "Angelo Stiller", "Enzo Millot", "Chris Führich", "El Bilal Touré"] },
      { id: "bl-6", name: "Eintracht Frankfurt", logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg", points: 58, players: ["Omar Marmoush", "Hugo Ekitiké", "Kevin Trapp", "Robin Koch", "Arthur Theate", "Rasmus Kristensen", "Ellyes Skhiri", "Hugo Larsson", "Mario Götze", "Ansgar Knauff", "Can Uzun"] },
      { id: "bl-7", name: "Freiburg", logo: "https://upload.wikimedia.org/wikipedia/en/6/6d/SC_Freiburg_logo.svg", points: 52, players: ["Vincenzo Grifo", "Ritsu Doan", "Noah Atubolu", "Philipp Lienhart", "Matthias Ginter", "Lukas Kübler", "Christian Günter", "Maximilian Eggestein", "Nicolas Höfler", "Eren Dinkçi", "Michael Gregoritsch"] },
      { id: "bl-8", name: "Union Berlin", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_logo.svg", points: 48, players: ["Tom Rothe", "Yorbe Vertessen", "Frederik Rønnow", "Danilho Doekhi", "Kevin Vogt", "Diogo Leite", "Christopher Trimmel", "Rani Khedira", "András Schäfer", "Jeong Woo-yeong", "Benedict Hollerbach"] },
      { id: "bl-9", name: "Werder Bremen", logo: "https://upload.wikimedia.org/wikipedia/commons/b/be/SV-Werder-Bremen-Logo.svg", points: 45, players: ["Marvin Ducksch", "Mitchell Weiser", "Michael Zetterer", "Marco Friedl", "Milos Veljkovic", "Felix Agu", "Senne Lynen", "Jens Stage", "Romano Schmid", "Justin Njinmah", "Keke Topp"] },
      { id: "bl-10", name: "Heidenheim", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/70/1._FC_Heidenheim_logo.svg/1200px-1._FC_Heidenheim_logo.svg.png", points: 42, players: ["Paul Wanner", "Marvin Pieringer", "Kevin Müller", "Patrick Mainka", "Benedikt Gimber", "Jonas Föhrenbach", "Lennard Maloney", "Jan Schöppner", "Adrian Beck", "Léo Scienza", "Maximilian Breunig"] }
    ]
  },
  "5": { // Ligue 1
    name: "Ligue 1",
    teams: [
      { id: "l1-1", name: "PSG", logo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg", points: 85, players: ["Ousmane Dembélé", "Bradley Barcola", "Vitinha", "Warren Zaïre-Emery", "Gianluigi Donnarumma", "Marquinhos", "Achraf Hakimi", "Nuno Mendes", "Joao Neves", "Randal Kolo Muani", "Lee Kang-in"] },
      { id: "l1-2", name: "Monaco", logo: "https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg", points: 75, players: ["Lamine Camara", "Denis Zakaria", "Breel Embolo", "Philipp Köhn", "Thilo Kehrer", "Mohammed Salisu", "Vanderson", "Caio Henrique", "Maghnes Akliouche", "Eliesse Ben Seghir", "Folarin Balogun"] },
      { id: "l1-3", name: "Marseille", logo: "https://upload.wikimedia.org/wikipedia/en/4/43/Olympique_de_Marseille_logo.svg", points: 72, players: ["Mason Greenwood", "Elye Wahi", "Pierre-Emile Højbjerg", "Adrien Rabiot", "Geronimo Rulli", "Derek Cornelius", "Leonardo Balerdi", "Michael Murillo", "Jonathan Rowe", "Amine Harit", "Neal Maupay"] },
      { id: "l1-4", name: "Lille", logo: "https://upload.wikimedia.org/wikipedia/en/3/3f/Lille_OSC_2018_logo.svg", points: 68, players: ["Jonathan David", "Edon Zhegrova", "Lucas Chevalier", "Bafodé Diakité", "Alexsandro", "Tiago Santos", "Benjamin André", "Angel Gomes", "Ethan Mbappé", "Mohamed Bayo", "Rémy Cabella"] },
      { id: "l1-5", name: "Lyon", logo: "https://upload.wikimedia.org/wikipedia/en/e/e2/Olympique_Lyonnais_logo.svg", points: 64, players: ["Alexandre Lacazette", "Georges Mikautadze", "Rayan Cherki", "Lucas Perri", "Duje Ćaleta-Car", "Moussa Niakhaté", "Nicolas Tagliafico", "Corentin Tolisso", "Nemanja Matić", "Wilfried Zaha", "Ernest Nuamah"] },
      { id: "l1-6", name: "Lens", logo: "https://upload.wikimedia.org/wikipedia/en/c/cc/RC_Lens_logo_2014.svg", points: 60, players: ["Brice Samba", "Kevin Danso", "Facundo Medina", "Jonathan Gradit", "Przemysław Frankowski", "Deiver Machado", "Andy Diouf", "Nampalys Mendy", "M'Bala Nzola", "Florian Sotoca", "Martin Satriano"] },
      { id: "l1-7", name: "Nice", logo: "https://upload.wikimedia.org/wikipedia/en/2/2e/OGC_Nice_logo.svg", points: 58, players: ["Youssoufa Moukoko", "Jérémie Boga", "Marcin Bułka", "Dante", "Moïse Bombito", "Jonathan Clauss", "Melvin Bard", "Pablo Rosario", "Tanguy Ndombele", "Evann Guessand", "Gaëtan Laborde"] },
      { id: "l1-8", name: "Reims", logo: "https://upload.wikimedia.org/wikipedia/en/0/02/Stade_de_Reims_logo.svg", points: 52, players: ["Junya Ito", "Keito Nakamura", "Yehvann Diouf", "Emmanuel Agbadou", "Joseph Okumu", "Aurélio Buta", "Marshall Munetsi", "Valentin Atangana", "Teddy Teuma", "Oumar Diakité", "Reda Khadra"] },
      { id: "l1-9", name: "Rennes", logo: "https://upload.wikimedia.org/wikipedia/en/9/9e/Stade_Rennais_FC.svg", points: 50, players: ["Ludovic Blas", "Arnaud Kalimuendo", "Steve Mandanda", "Christopher Wooh", "Leo Østigård", "Hans Hateboer", "Adrien Truffert", "Glen Kamara", "Azor Matusiwa", "Amine Gouiri", "Jota"] },
      { id: "l1-10", name: "Brest", logo: "https://upload.wikimedia.org/wikipedia/en/0/05/Stade_Brestois_29_logo.svg", points: 48, players: ["Romain Del Castillo", "Ludovic Ajorque", "Marco Bizot", "Brendan Chardonnet", "Soumaïla Coulibaly", "Kenny Lala", "Jordan Amavi", "Pierre Lees-Melou", "Mahdi Camara", "Mama Baldé", "Abdallah Sima"] }
    ]
  }
};

const result = {};
Object.entries(leagues).forEach(([lId, lInfo]) => {
  lInfo.teams.forEach((team, idx) => {
    result[team.id] = {
      name: team.name,
      logo: team.logo,
      city: "Unknown",
      stadium: "Home Stadium",
      league: lId,
      points: team.points,
      rank: idx + 1,
      players: team.players.map((p, pIdx) => ({
        playerID: `${team.id}-p${pIdx}`,
        fullName: p,
        position: pIdx === 0 && lId === "5" ? "FW" : (pIdx === 5 ? "GK" : (pIdx <= 4 ? (pIdx <= 1 ? "FW" : "MF") : "DF")),
        country: "Various"
      }))
    };
  });
});

console.log(JSON.stringify(result, null, 2));
