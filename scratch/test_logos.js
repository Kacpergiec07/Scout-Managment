fetch('https://api.statorium.com/media/bearleague/club_logo_37.png')
  .then(res => console.log('Status 37:', res.status))
  .catch(err => console.log('Error 37:', err.message));

fetch('https://api.statorium.com/media/bearleague/club_logo_66.png')
  .then(res => console.log('Status 66:', res.status))
  .catch(err => console.log('Error 66:', err.message));
