import { resolvePlayerPhoto } from './app/actions/statorium';

const player = {
    playerID: "95803",
    fullName: "Lamini Fati",
    photo: ""
};

console.log('Resolved photo:', resolvePlayerPhoto(player));
