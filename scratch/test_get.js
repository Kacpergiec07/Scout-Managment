"use server";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStandingsAction = getStandingsAction;
exports.getSeasonDetailsAction = getSeasonDetailsAction;
exports.getTeamLogosAction = getTeamLogosAction;
exports.getClubProfileDataAction = getClubProfileDataAction;
exports.getTeamDetailsAction = getTeamDetailsAction;
exports.searchPlayersAction = searchPlayersAction;
exports.getPlayerPhotoAction = getPlayerPhotoAction;
exports.getPlayerPhotosAction = getPlayerPhotosAction;
exports.getMatchesAction = getMatchesAction;
exports.getUpcomingMatchesAction = getUpcomingMatchesAction;
exports.getTeamRecentMatchesAction = getTeamRecentMatchesAction;
exports.getMatchDetailsAction = getMatchDetailsAction;
exports.getTopLeaguesClubsAction = getTopLeaguesClubsAction;
exports.getAllTop5ClubsAction = getAllTop5ClubsAction;
exports.getAllTop5PlayersAction = getAllTop5PlayersAction;
exports.getPlayerDetailsAction = getPlayerDetailsAction;
exports.getPlayersByClubAction = getPlayersByClubAction;
exports.getTransfersAction = getTransfersAction;
exports.getPlayersAction = getPlayersAction;
exports.getTeamLogoAction = getTeamLogoAction;
exports.getPlayerFullDataAction = getPlayerFullDataAction;
exports.getPlayerDataAction = getPlayerDataAction;
exports.getTopScorersAction = getTopScorersAction;
exports.getEnrichedPlayerDataAction = getEnrichedPlayerDataAction;
exports.getLeagueHubDataAction = getLeagueHubDataAction;
exports.getComparisonDataAction = getComparisonDataAction;
var react_1 = require("react");
var client_1 = require("@/lib/statorium/client");
var coaches_data_1 = require("@/lib/coaches-data");
var formation_service_1 = require("@/lib/statorium/formation-service");
var statorium_data_1 = require("@/lib/statorium-data");
var server_1 = require("@/lib/supabase/server");
var sync_1 = require("./sync");
var fs = require("fs");
var path = require("path");
var getStatoriumClient = (0, react_1.cache)(function () {
    return new client_1.StatoriumClient(process.env.STATORIUM_API_KEY);
});
// Global in-memory cache for high-frequency server-side requests
var GLOBAL_CACHE = new Map();
var CACHE_TTL = 10 * 60 * 1000; // 10 minutes
function getCached(key) {
    var cached = GLOBAL_CACHE.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}
function setCache(key, data) {
    GLOBAL_CACHE.set(key, { data: data, timestamp: Date.now() });
}
function normalizeName(name) {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u00f8\u00d8]/g, 'o').replace(/\u00df/g, 'ss').replace(/\u0131/g, 'i').replace(/\u0219/g, 's').replace(/\u021b/g, 't').replace(/[\u0107\u0106]/g, 'c').replace(/[\u017e\u017d]/g, 'z').replace(/[\u0161\u0160]/g, 's').toLowerCase().trim();
}
var _photoIdx = null;
function getPhotoIdx() {
    if (_photoIdx)
        return _photoIdx;
    _photoIdx = new Map();
    if (typeof statorium_data_1.PLAYER_PHOTOS !== 'undefined') {
        for (var _i = 0, _a = Object.entries(statorium_data_1.PLAYER_PHOTOS); _i < _a.length; _i++) {
            var _b = _a[_i], name = _b[0], url = _b[1];
            _photoIdx.set(normalizeName(name), url);
        }
    }
    return _photoIdx;
}
var POSITION_MAP = { "1": "GK", "2": "DF", "3": "MF", "4": "FW", "Goalkeeper": "GK", "Defender": "DF", "Midfielder": "MF", "Forward": "FW", "Attacker": "FW", "Atacker": "FW", "Atacante": "FW", "Defensa": "DF", "Centrocampista": "MF" };
var POSITION_OVERRIDE = { "14633": "CAM", "12101": "CAM", "6466": "CM", "93": "CM", "2773": "CDM", "26718": "CDM", "53041": "RW", "5597": "CAM", "1352": "CAM", "1812": "ST", "1994": "FW", "4812": "ST" };
function resolvePosition(raw, playerId) {
    if (playerId && POSITION_OVERRIDE[playerId])
        return POSITION_OVERRIDE[playerId];
    if (!raw)
        return "N/A";
    var str = String(raw).trim();
    if (POSITION_MAP[str])
        return POSITION_MAP[str];
    if (str.length <= 3 && /[A-Z]{2,3}/.test(str))
        return str;
    return str;
}
function resolvePlayerPhoto(p) {
    if (!p)
        return "";
    var name = (p.fullName || "".concat(p.firstName, " ").concat(p.lastName) || '').trim();
    if (typeof statorium_data_1.PLAYER_PHOTOS !== 'undefined' && name && statorium_data_1.PLAYER_PHOTOS[name])
        return statorium_data_1.PLAYER_PHOTOS[name];
    var idx = getPhotoIdx();
    var nl = normalizeName(name);
    if (idx.has(nl))
        return idx.get(nl);
    var photo = p.playerPhoto || p.photo;
    if (photo && !photo.startsWith('http')) {
        var cleanPath = photo.startsWith('/') ? photo : "/" + photo;
        if (!cleanPath.startsWith('/media/bearleague/')) {
            photo = "https://api.statorium.com/media/bearleague" + cleanPath;
        }
        else {
            photo = "https://api.statorium.com" + cleanPath;
        }
    }
    return photo || "https://api.statorium.com/media/bearleague/bl" + (p.playerID || p.id) + ".webp";
}
/**
 * Adjusts a UTC date/time string from Statorium to Europe/Warsaw timezone.
 */
function formatToWarsaw(dateStr, timeStr) {
    if (!dateStr)
        return { date: dateStr, time: timeStr };
    try {
        // Statorium usually provides date as YYYY-MM-DD and time as HH:mm
        // We assume these are in UTC as the user reports they are "too early" (UTC vs PL time)
        var combined = "".concat(dateStr, "T").concat(timeStr || '00:00', ":00Z");
        var date = new Date(combined);
        if (isNaN(date.getTime()))
            return { date: dateStr, time: timeStr };
        var options = {
            timeZone: 'Europe/Warsaw',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        // Use en-CA for YYYY-MM-DD format parts, but we'll manually assemble to be sure
        var parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(date);
        var p_1 = {};
        parts.forEach(function (part) { p_1[part.type] = part.value; });
        return {
            date: "".concat(p_1.year, "-").concat(p_1.month, "-").concat(p_1.day),
            time: "".concat(p_1.hour, ":").concat(p_1.minute)
        };
    }
    catch (e) {
        console.error("Error converting to Warsaw time:", e);
        return { date: dateStr, time: timeStr };
    }
}
function getStandingsAction(seasonId) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, cached, client, standings, allMatches_1, e_1, processedStandings, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cacheKey = "standings_".concat(seasonId);
                    cached = getCached(cacheKey);
                    if (cached)
                        return [2 /*return*/, cached];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    client = getStatoriumClient();
                    return [4 /*yield*/, client.getStandings(seasonId)];
                case 2:
                    standings = _a.sent();
                    console.log("[Action] getStandingsAction for ".concat(seasonId, ": found ").concat((standings === null || standings === void 0 ? void 0 : standings.length) || 0, " teams"));
                    if (!(standings && standings.length > 0)) return [3 /*break*/, 7];
                    allMatches_1 = [];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, client.getMatches(seasonId)];
                case 4:
                    allMatches_1 = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    console.warn('Could not fetch matches for form calculation');
                    return [3 /*break*/, 6];
                case 6:
                    processedStandings = standings.map(function (s) {
                        var stats = {};
                        try {
                            stats = typeof s.options === 'string' ? JSON.parse(s.options) : (s.options || {});
                        }
                        catch (e) { }
                        var teamId = (s.teamID || s.team_id || s.id || "").toString();
                        var teamName = s.teamName || s.team_name || s.teamMiddleName || "Unknown Team";
                        var teamLogo = resolveTeamLogo(s.logo || s.teamLogo || s.team_logo || s);
                        if (!teamLogo && teamId && teamId !== "undefined") {
                            teamLogo = "https://api.statorium.com/media/bearleague/ct".concat(teamId, ".png");
                        }
                        // Calculate form from actual matches
                        var calculatedForm = [];
                        var cleanTeamName = teamName.toLowerCase().trim();
                        if (allMatches_1.length > 0) {
                            var teamMatches = allMatches_1.filter(function (m) {
                                var _a, _b, _c, _d, _e, _f;
                                var hId = (m.homeID || m.home_id || m.homeParticipantID || m.homeTeamID || m.home_participant_id || ((_a = m.homeParticipant) === null || _a === void 0 ? void 0 : _a.participantID) || "").toString();
                                var aId = (m.awayID || m.away_id || m.awayParticipantID || m.awayTeamID || m.away_participant_id || ((_b = m.awayParticipant) === null || _b === void 0 ? void 0 : _b.participantID) || "").toString();
                                var hName = (m.homeName || m.home_name || m.homeParticipantName || "").toLowerCase();
                                var aName = (m.awayName || m.away_name || m.awayParticipantName || "").toLowerCase();
                                // Check if match was played (has score AND is not in the future)
                                var hScore = (_e = (_d = (_c = m.homeScore) !== null && _c !== void 0 ? _c : m.home_score) !== null && _d !== void 0 ? _d : m.homeScore_chk) !== null && _e !== void 0 ? _e : (_f = m.homeParticipant) === null || _f === void 0 ? void 0 : _f.score;
                                var mDate = new Date(m.matchDate || m.match_date || "1900-01-01");
                                var now = new Date();
                                var played = hScore !== undefined && hScore !== null && hScore.toString() !== "" && mDate <= now;
                                var isHome = hId === teamId || (cleanTeamName && hName.includes(cleanTeamName));
                                var isAway = aId === teamId || (cleanTeamName && aName.includes(cleanTeamName));
                                return played && (isHome || isAway);
                            });
                            teamMatches.sort(function (a, b) {
                                var dateA = new Date("".concat(a.matchDate || a.match_date, " ").concat(a.matchTime || a.match_time || '00:00'));
                                var dateB = new Date("".concat(b.matchDate || b.match_date, " ").concat(b.matchTime || b.match_time || '00:00'));
                                return dateB.getTime() - dateA.getTime();
                            });
                            calculatedForm = teamMatches.slice(0, 5).map(function (m) {
                                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                                var hId = (m.homeID || m.home_id || m.homeParticipantID || m.homeTeamID || m.home_participant_id || ((_a = m.homeParticipant) === null || _a === void 0 ? void 0 : _a.participantID) || "").toString();
                                var hName = (m.homeName || m.home_name || m.homeParticipantName || ((_b = m.homeParticipant) === null || _b === void 0 ? void 0 : _b.participantName) || "").toLowerCase();
                                var hScore = parseInt((_g = (_e = (_d = (_c = m.homeScore) !== null && _c !== void 0 ? _c : m.home_score) !== null && _d !== void 0 ? _d : m.homeScore_chk) !== null && _e !== void 0 ? _e : (_f = m.homeParticipant) === null || _f === void 0 ? void 0 : _f.score) !== null && _g !== void 0 ? _g : "0");
                                var aScore = parseInt((_m = (_k = (_j = (_h = m.awayScore) !== null && _h !== void 0 ? _h : m.away_score) !== null && _j !== void 0 ? _j : m.awayScore_chk) !== null && _k !== void 0 ? _k : (_l = m.awayParticipant) === null || _l === void 0 ? void 0 : _l.score) !== null && _m !== void 0 ? _m : "0");
                                var isHome = hId === teamId || (cleanTeamName && hName.includes(cleanTeamName));
                                var res = isHome ? (hScore > aScore ? "W" : hScore < aScore ? "L" : "D") : (aScore > hScore ? "W" : aScore < hScore ? "L" : "D");
                                return { result: res, matchId: (m.matchID || m.match_id || m.id).toString() };
                            });
                        }
                        // DEEP FALLBACK: Use team's own results list IF available in standings OR a dummy pattern that matches their REAL season stats
                        if (calculatedForm.length === 0) {
                            var formString = (s.form || stats.form || "").toString();
                            if (formString && formString.length >= 1) {
                                var formArray = formString.split('').filter(function (c) { return ['W', 'D', 'L'].includes(c.toUpperCase()); });
                                calculatedForm = formArray.slice(0, 5).map(function (res) { return ({
                                    result: res.toUpperCase(),
                                    matchId: "static"
                                }); });
                            }
                        }
                        // FINAL FAILSAFE: If still nothing, use a simple W-D-L sequence based on their wins/losses (not random, just deterministic)
                        if (calculatedForm.length === 0) {
                            var w = parseInt(stats.win_chk || s.won || "0");
                            var d = parseInt(stats.draw_chk || s.drawn || "0");
                            var l = parseInt(stats.lost_chk || s.lost || "0");
                            var results = [];
                            for (var i = 0; i < w && i < 5; i++)
                                results.push("W");
                            for (var i = 0; i < d && results.length < 5; i++)
                                results.push("D");
                            for (var i = 0; i < l && results.length < 5; i++)
                                results.push("L");
                            calculatedForm = results.map(function (r) { return ({ result: r, matchId: "static" }); });
                        }
                        return {
                            teamID: teamId,
                            teamName: teamName,
                            teamLogo: teamLogo,
                            rank: parseInt(s.ordering || s.rank || s.position || "0"),
                            played: parseInt(stats.played_chk || s.played || s.matches_played || "0"),
                            won: parseInt(stats.win_chk || s.won || s.wins || "0"),
                            drawn: parseInt(stats.draw_chk || s.drawn || s.draws || "0"),
                            lost: parseInt(stats.lost_chk || s.lost || s.losses || "0"),
                            goalsFor: parseInt(stats.goalscore_chk || s.goalsFor || s.goals_for || "0"),
                            goalsAgainst: parseInt(stats.goalconc_chk || s.goalsAgainst || s.goals_against || "0"),
                            points: parseInt(stats.point_chk || s.points || "0"),
                            formObjects: calculatedForm,
                        };
                    }).sort(function (a, b) { return parseInt(b.points) - parseInt(a.points) || parseInt(a.position) - parseInt(b.position); });
                    setCache(cacheKey, processedStandings);
                    return [2 /*return*/, processedStandings];
                case 7: return [2 /*return*/, []];
                case 8:
                    error_1 = _a.sent();
                    console.error('Get Standings Action Error:', error_1);
                    return [2 /*return*/, []];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function getSeasonDetailsAction(seasonId) {
    return __awaiter(this, void 0, void 0, function () {
        var client, data, TOP_5_MAP, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    client = getStatoriumClient();
                    return [4 /*yield*/, client.getStandings(seasonId)];
                case 1:
                    data = _a.sent();
                    TOP_5_MAP = {
                        "515": { name: "Premier League", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/13.png" },
                        "558": { name: "La Liga", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/53.png" },
                        "511": { name: "Serie A", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/31.png" },
                        "521": { name: "Bundesliga", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/19.png" },
                        "519": { name: "Ligue 1", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/16.png" }
                    };
                    if (TOP_5_MAP[seasonId])
                        return [2 /*return*/, TOP_5_MAP[seasonId]];
                    return [2 /*return*/, { name: "League Details", logo: "" }];
                case 2:
                    error_2 = _a.sent();
                    console.error('Get Season Details Action Error:', error_2);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function resolveTeamLogo(logo) {
    if (!logo)
        return "";
    var path = typeof logo === 'string' ? logo : (logo.logo || logo.teamLogo || "");
    if (!path)
        return "";
    if (path.startsWith('http'))
        return path;
    var cleanPath = path.startsWith('/') ? path : "/".concat(path);
    if (!cleanPath.startsWith('/media/bearleague/')) {
        return "https://api.statorium.com/media/bearleague".concat(cleanPath);
    }
    return "https://api.statorium.com".concat(cleanPath);
}
function getTeamLogosAction(teamIds) {
    return __awaiter(this, void 0, Promise, function () {
        var logoMap, client_2, results, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logoMap = {};
                    if (!teamIds.length)
                        return [2 /*return*/, logoMap];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    client_2 = getStatoriumClient();
                    return [4 /*yield*/, Promise.allSettled(teamIds.map(function (id) { return client_2.getTeamDetails(id); }))];
                case 2:
                    results = _a.sent();
                    results.forEach(function (result, idx) {
                        var id = teamIds[idx];
                        var logo = "";
                        if (result.status === 'fulfilled' && result.value) {
                            logo = resolveTeamLogo(result.value);
                        }
                        // Fallback for major Statorium club IDs if details failed 
                        // ct[ID].png is the standard naming convention for team logos
                        if (!logo && id && id !== "hub" && id !== "undefined") {
                            logo = "https://api.statorium.com/media/bearleague/ct".concat(id, ".png");
                        }
                        logoMap[id] = logo;
                    });
                    return [2 /*return*/, logoMap];
                case 3:
                    error_3 = _a.sent();
                    console.error('Get Team Logos Action Error:', error_3);
                    return [2 /*return*/, logoMap];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getClubProfileDataAction(teamId, seasonId) {
    return __awaiter(this, void 0, void 0, function () {
        var teamDetails, leagueInfo, standing, finalSeasonId, _i, TOP_LEAGUES_1, league, client, standings, e_2, standings, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, getTeamDetailsAction(teamId, seasonId)];
                case 1:
                    teamDetails = _a.sent();
                    if (!teamDetails)
                        return [2 /*return*/, null];
                    leagueInfo = null;
                    standing = null;
                    finalSeasonId = seasonId;
                    if (!!finalSeasonId) return [3 /*break*/, 7];
                    _i = 0, TOP_LEAGUES_1 = TOP_LEAGUES;
                    _a.label = 2;
                case 2:
                    if (!(_i < TOP_LEAGUES_1.length)) return [3 /*break*/, 7];
                    league = TOP_LEAGUES_1[_i];
                    client = getStatoriumClient();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, client.getStandings(league.id)];
                case 4:
                    standings = _a.sent();
                    if (standings.find(function (s) { var _a; return ((_a = s.teamID) === null || _a === void 0 ? void 0 : _a.toString()) === teamId; })) {
                        finalSeasonId = league.id;
                        return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    e_2 = _a.sent();
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    if (!finalSeasonId) return [3 /*break*/, 10];
                    return [4 /*yield*/, getSeasonDetailsAction(finalSeasonId)];
                case 8:
                    leagueInfo = _a.sent();
                    return [4 /*yield*/, getStandingsAction(finalSeasonId)];
                case 9:
                    standings = _a.sent();
                    standing = standings.find(function (s) { var _a; return ((_a = s.teamID) === null || _a === void 0 ? void 0 : _a.toString()) === teamId; });
                    _a.label = 10;
                case 10: return [2 /*return*/, { teamDetails: teamDetails, leagueInfo: leagueInfo, standing: standing, seasonId: finalSeasonId }];
                case 11:
                    error_4 = _a.sent();
                    console.error("Get Club Profile Data Action Error:", error_4);
                    return [2 /*return*/, null];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function getTeamDetailsAction(teamId, seasonId) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, cachedTeam, cachedPlayers, client, _i, TOP_LEAGUES_2, league, standings, found, e_3, apiTeam, e_4, players, e_5, calculateAge, firstTeamPlayers, gks, dfs, mfs, fws, formationResult, formation, realLineupIds_1, startingXI, gks_1, dfs_1, mfs_1, fws_1, d, m, f, parts, usedIds_1, remaining, startingIds_1, sortedPlayers, enrichedPlayers, result, error_5;
        var _this = this;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!teamId || teamId === 'undefined')
                        return [2 /*return*/, null];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 22, , 23]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 2:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase
                            .from('cached_teams')
                            .select('*')
                            .eq('id', teamId)
                            .single()];
                case 3:
                    cachedTeam = (_d.sent()).data;
                    if (!cachedTeam) return [3 /*break*/, 5];
                    console.log("[Cache] Hit for team ".concat(teamId));
                    return [4 /*yield*/, (0, sync_1.getCachedPlayersByTeam)(teamId)];
                case 4:
                    cachedPlayers = _d.sent();
                    if (cachedPlayers && cachedPlayers.length > 0) {
                        return [2 /*return*/, {
                                teamID: teamId,
                                teamName: cachedTeam.name,
                                teamLogo: cachedTeam.logo,
                                players: cachedPlayers.map(function (p) { return ({
                                    playerID: p.id,
                                    fullName: p.full_name,
                                    position: p.position,
                                    photo: p.photo_url,
                                    additionalInfo: { birthdate: p.birthdate },
                                    stat: p.stats,
                                    medicalReport: p.injury_status,
                                    contractStatus: p.contract_expiry
                                }); }),
                                formation: 'N/A'
                            }];
                    }
                    _d.label = 5;
                case 5:
                    client = getStatoriumClient();
                    if (!!seasonId) return [3 /*break*/, 11];
                    _i = 0, TOP_LEAGUES_2 = TOP_LEAGUES;
                    _d.label = 6;
                case 6:
                    if (!(_i < TOP_LEAGUES_2.length)) return [3 /*break*/, 11];
                    league = TOP_LEAGUES_2[_i];
                    _d.label = 7;
                case 7:
                    _d.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, client.getStandings(league.id)];
                case 8:
                    standings = _d.sent();
                    found = standings.find(function (s) { var _a; return ((_a = s.teamID) === null || _a === void 0 ? void 0 : _a.toString()) === teamId; });
                    if (found) {
                        seasonId = league.id;
                        return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 10];
                case 9:
                    e_3 = _d.sent();
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 6];
                case 11:
                    apiTeam = null;
                    _d.label = 12;
                case 12:
                    _d.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, client.getTeamDetails(teamId)];
                case 13:
                    apiTeam = _d.sent();
                    return [3 /*break*/, 15];
                case 14:
                    e_4 = _d.sent();
                    return [3 /*break*/, 15];
                case 15:
                    players = [];
                    if (!seasonId) return [3 /*break*/, 19];
                    _d.label = 16;
                case 16:
                    _d.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, client.getPlayersByTeam(teamId, seasonId)];
                case 17:
                    players = _d.sent();
                    return [3 /*break*/, 19];
                case 18:
                    e_5 = _d.sent();
                    return [3 /*break*/, 19];
                case 19:
                    if (!players.length && ((_a = apiTeam === null || apiTeam === void 0 ? void 0 : apiTeam.players) === null || _a === void 0 ? void 0 : _a.length)) {
                        players = apiTeam.players;
                    }
                    calculateAge = function (birthdate) {
                        if (!birthdate)
                            return 0;
                        // Birthdate format: "DD-MM-YYYY (Age)" or similar
                        var match = birthdate.match(/(\d{2})-(\d{2})-(\d{4})/);
                        if (!match)
                            return 0;
                        var year = match[3];
                        var birthYear = parseInt(year);
                        var currentYear = new Date().getFullYear();
                        return currentYear - birthYear;
                    };
                    firstTeamPlayers = players.filter(function (p) {
                        // Must be active
                        return p.playerDeparted === "0";
                    });
                    gks = firstTeamPlayers.filter(function (p) {
                        var _a;
                        var pos = (p.position || ((_a = p.additionalInfo) === null || _a === void 0 ? void 0 : _a.position) || '').toLowerCase();
                        return pos === 'goalkeeper' || pos === 'gk' || pos.startsWith('goal');
                    });
                    dfs = firstTeamPlayers.filter(function (p) {
                        var _a;
                        var pos = (p.position || ((_a = p.additionalInfo) === null || _a === void 0 ? void 0 : _a.position) || '').toLowerCase();
                        return pos === 'defender' || pos === 'df' || pos.startsWith('def') && !pos.includes('mid');
                    });
                    mfs = firstTeamPlayers.filter(function (p) {
                        var _a;
                        var pos = (p.position || ((_a = p.additionalInfo) === null || _a === void 0 ? void 0 : _a.position) || '').toLowerCase();
                        return pos === 'midfielder' || pos === 'mf' || pos.includes('mid');
                    });
                    fws = firstTeamPlayers.filter(function (p) {
                        var _a;
                        var pos = (p.position || ((_a = p.additionalInfo) === null || _a === void 0 ? void 0 : _a.position) || '').toLowerCase();
                        return pos === 'atacker' || pos === 'attacker' || pos === 'forward' || pos === 'fw' || pos === 'striker' || pos === 'st' || pos.includes('ata');
                    });
                    return [4 /*yield*/, (0, formation_service_1.getRealFormation)(teamId, seasonId || '')];
                case 20:
                    formationResult = _d.sent();
                    formation = formationResult.formation;
                    realLineupIds_1 = new Set(formationResult.lineup.map(function (p) { return p.playerID.toString(); }));
                    startingXI = firstTeamPlayers.filter(function (p) { return realLineupIds_1.has(p.playerID.toString()); });
                    // If real lineup is missing or incomplete, fallback to heuristic
                    if (startingXI.length < 7) {
                        gks_1 = firstTeamPlayers.filter(function (p) {
                            var _a;
                            var pos = (p.position || ((_a = p.additionalInfo) === null || _a === void 0 ? void 0 : _a.position) || '').toLowerCase();
                            return pos === 'goalkeeper' || pos === 'gk' || pos.startsWith('goal');
                        });
                        dfs_1 = firstTeamPlayers.filter(function (p) {
                            var _a;
                            var pos = (p.position || ((_a = p.additionalInfo) === null || _a === void 0 ? void 0 : _a.position) || '').toLowerCase();
                            return pos === 'defender' || pos === 'df' || pos.startsWith('def') && !pos.includes('mid');
                        });
                        mfs_1 = firstTeamPlayers.filter(function (p) {
                            var _a;
                            var pos = (p.position || ((_a = p.additionalInfo) === null || _a === void 0 ? void 0 : _a.position) || '').toLowerCase();
                            return pos === 'midfielder' || pos === 'mf' || pos.includes('mid');
                        });
                        fws_1 = firstTeamPlayers.filter(function (p) {
                            var _a;
                            var pos = (p.position || ((_a = p.additionalInfo) === null || _a === void 0 ? void 0 : _a.position) || '').toLowerCase();
                            return pos === 'atacker' || pos === 'attacker' || pos === 'forward' || pos === 'fw' || pos === 'striker' || pos === 'st' || pos.includes('ata');
                        });
                        d = 4, m = 4, f = 2;
                        if (formation && formation !== 'N/A') {
                            parts = formation.split('-').map(function (p) { return parseInt(p) || 0; });
                            if (parts.length === 3) {
                                d = parts[0] || 4;
                                m = parts[1] || 4;
                                f = parts[2] || 2;
                            }
                            else if (parts.length === 4) {
                                // Handle 4-row formations like 4-2-3-1
                                d = parts[0] || 4;
                                m = (parts[1] + parts[2]) || 5;
                                f = parts[3] || 1;
                            }
                        }
                        startingXI = [];
                        if (gks_1.length > 0)
                            startingXI.push(gks_1[0]);
                        startingXI.push.apply(startingXI, dfs_1.slice(0, d));
                        startingXI.push.apply(startingXI, mfs_1.slice(0, m));
                        startingXI.push.apply(startingXI, fws_1.slice(0, f));
                        if (startingXI.length < 11) {
                            usedIds_1 = new Set(startingXI.map(function (p) { return p.playerID.toString(); }));
                            remaining = firstTeamPlayers.filter(function (p) { return !usedIds_1.has(p.playerID.toString()); });
                            startingXI.push.apply(startingXI, remaining.slice(0, 11 - startingXI.length));
                        }
                    }
                    startingIds_1 = new Set(startingXI.map(function (p) { return p.playerID; }));
                    sortedPlayers = __spreadArray(__spreadArray([], startingXI, true), firstTeamPlayers.filter(function (p) { return !startingIds_1.has(p.playerID); }), true);
                    players = sortedPlayers;
                    return [4 /*yield*/, Promise.all(players.map(function (p) { return __awaiter(_this, void 0, void 0, function () {
                            var details, e_6;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        // If player already has stats, skip fetching
                                        if (p.stat && p.stat.length > 0)
                                            return [2 /*return*/, p];
                                        return [4 /*yield*/, getPlayerDetailsAction(p.playerID.toString())];
                                    case 1:
                                        details = _a.sent();
                                        if (details) {
                                            return [2 /*return*/, __assign(__assign(__assign({}, p), details), { stat: details.stat || [] })];
                                        }
                                        return [2 /*return*/, p];
                                    case 2:
                                        e_6 = _a.sent();
                                        console.warn("[Action] Failed to enrich player ".concat(p.playerID, ":"), e_6);
                                        return [2 /*return*/, p];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 21:
                    enrichedPlayers = _d.sent();
                    result = __assign(__assign({}, (apiTeam || {})), { teamID: teamId, teamName: (apiTeam === null || apiTeam === void 0 ? void 0 : apiTeam.teamName) || (apiTeam === null || apiTeam === void 0 ? void 0 : apiTeam.teamMiddleName) || "Club ".concat(teamId), teamLogo: (apiTeam === null || apiTeam === void 0 ? void 0 : apiTeam.logo) || (apiTeam === null || apiTeam === void 0 ? void 0 : apiTeam.teamLogo) || "", city: (apiTeam === null || apiTeam === void 0 ? void 0 : apiTeam.city) || "", venueName: (apiTeam === null || apiTeam === void 0 ? void 0 : apiTeam.venueName) || ((_b = apiTeam === null || apiTeam === void 0 ? void 0 : apiTeam.homeVenue) === null || _b === void 0 ? void 0 : _b.name) || "", coach: coaches_data_1.COACH_MAP[teamId] || ((_c = apiTeam === null || apiTeam === void 0 ? void 0 : apiTeam.additionalInfo) === null || _c === void 0 ? void 0 : _c.coach), formation: formation, players: enrichedPlayers.map(function (p) {
                            var _a;
                            return (__assign(__assign({}, p), { playerPhoto: resolvePlayerPhoto(p), position: resolvePosition(p.position || ((_a = p.additionalInfo) === null || _a === void 0 ? void 0 : _a.position), p.playerID) }));
                        }) });
                    return [2 /*return*/, result];
                case 22:
                    error_5 = _d.sent();
                    console.error('Get Team Details Error:', error_5);
                    return [2 /*return*/, null];
                case 23: return [2 /*return*/];
            }
        });
    });
}
function searchPlayersAction(query) {
    return __awaiter(this, void 0, void 0, function () {
        var client, apiResults, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!query || query.length < 2)
                        return [2 /*return*/, []];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    client = getStatoriumClient();
                    return [4 /*yield*/, client.searchPlayers(query)];
                case 2:
                    apiResults = _a.sent();
                    return [2 /*return*/, apiResults.map(function (p) { return (__assign(__assign({}, p), { playerPhoto: resolvePlayerPhoto(p) })); }).slice(0, 10)];
                case 3:
                    error_6 = _a.sent();
                    console.error('Search Players Action Error:', error_6);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches a player's photo URL directly from the player details endpoint.
 * The /players/{id}/ endpoint reliably returns the `photo` field unlike search results.
 */
function getPlayerPhotoAction(playerId) {
    return __awaiter(this, void 0, Promise, function () {
        var client, player, photoUrl, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!playerId || playerId.length < 1)
                        return [2 /*return*/, null];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    client = getStatoriumClient();
                    return [4 /*yield*/, client.getPlayerDetails(playerId)];
                case 2:
                    player = _a.sent();
                    photoUrl = (player === null || player === void 0 ? void 0 : player.photo) || (player === null || player === void 0 ? void 0 : player.playerPhoto) || null;
                    // If no photo URL is found, use the standard fallback format used in leagues
                    if (!photoUrl || photoUrl === "") {
                        photoUrl = "https://api.statorium.com/media/bearleague/bl".concat(playerId, ".webp");
                    }
                    if (photoUrl && (photoUrl.startsWith('http') || photoUrl.startsWith('/'))) {
                        return [2 /*return*/, photoUrl];
                    }
                    return [2 /*return*/, photoUrl];
                case 3:
                    error_7 = _a.sent();
                    console.error("getPlayerPhotoAction error for id=".concat(playerId, ":"), error_7);
                    // Even on error, we can try the fallback if we have an ID
                    return [2 /*return*/, "https://api.statorium.com/media/bearleague/bl".concat(playerId, ".webp")];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches player photos for multiple players in parallel.
 * Returns a map of playerID -> photoUrl (or null if not found).
 */
function getPlayerPhotosAction(players) {
    return __awaiter(this, void 0, Promise, function () {
        var results, photoMap, _i, results_1, result;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.allSettled(players.map(function (p) { return __awaiter(_this, void 0, void 0, function () {
                        var idx, nl, photo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    // Priority 1: Name-based lookup in static data
                                    if (typeof statorium_data_1.PLAYER_PHOTOS !== 'undefined' && p.playerName && statorium_data_1.PLAYER_PHOTOS[p.playerName]) {
                                        return [2 /*return*/, { id: p.playerID, photo: statorium_data_1.PLAYER_PHOTOS[p.playerName] }];
                                    }
                                    idx = getPhotoIdx();
                                    nl = normalizeName(p.playerName);
                                    if (idx.has(nl)) {
                                        return [2 /*return*/, { id: p.playerID, photo: idx.get(nl) }];
                                    }
                                    return [4 /*yield*/, getPlayerPhotoAction(p.playerID)];
                                case 1:
                                    photo = _a.sent();
                                    return [2 /*return*/, { id: p.playerID, photo: photo || "https://api.statorium.com/media/bearleague/bl".concat(p.playerID, ".webp") }];
                            }
                        });
                    }); }))];
                case 1:
                    results = _a.sent();
                    photoMap = {};
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        result = results_1[_i];
                        if (result.status === 'fulfilled') {
                            photoMap[result.value.id] = result.value.photo;
                        }
                    }
                    return [2 /*return*/, photoMap];
            }
        });
    });
}
function getMatchesAction(seasonId) {
    return __awaiter(this, void 0, void 0, function () {
        var client, matches, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    client = getStatoriumClient();
                    return [4 /*yield*/, client.getMatches(seasonId)];
                case 1:
                    matches = _a.sent();
                    if (matches && matches.length > 0) {
                        return [2 /*return*/, matches.map(function (m) {
                                var _a = formatToWarsaw(m.matchDate || m.match_date, m.matchTime || m.match_time), date = _a.date, time = _a.time;
                                return __assign(__assign({}, m), { matchDate: date, matchTime: time });
                            })];
                    }
                    return [2 /*return*/, []];
                case 2:
                    error_8 = _a.sent();
                    console.error('Get Matches Action Error:', error_8);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getUpcomingMatchesAction(seasonId_1) {
    return __awaiter(this, arguments, void 0, function (seasonId, limit) {
        var cacheKey, cached, client, allMatches, today_1, upcomingMatches, processed, error_9;
        if (limit === void 0) { limit = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cacheKey = "upcoming_".concat(seasonId, "_").concat(limit);
                    cached = getCached(cacheKey);
                    if (cached)
                        return [2 /*return*/, cached];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    client = getStatoriumClient();
                    return [4 /*yield*/, client.getMatches(seasonId)];
                case 2:
                    allMatches = _a.sent();
                    if (!allMatches || allMatches.length === 0)
                        return [2 /*return*/, []];
                    today_1 = new Date();
                    today_1.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
                    upcomingMatches = allMatches.filter(function (match) {
                        if (!match.matchDate)
                            return false;
                        var matchDate = new Date(match.matchDate);
                        // Set match date to start of day for accurate comparison
                        matchDate.setHours(0, 0, 0, 0);
                        return matchDate >= today_1;
                    });
                    // Sort chronologically (from nearest to furthest)
                    upcomingMatches.sort(function (a, b) {
                        var dateA = new Date(a.matchDate);
                        var dateB = new Date(b.matchDate);
                        // First compare by date
                        if (dateA.getTime() !== dateB.getTime()) {
                            return dateA.getTime() - dateB.getTime();
                        }
                        // If dates are equal, compare by time
                        var timeA = a.matchTime || '00:00';
                        var timeB = b.matchTime || '00:00';
                        return timeA.localeCompare(timeB);
                    });
                    processed = upcomingMatches.slice(0, limit).map(function (m) {
                        var _a, _b, _c, _d;
                        var homeId = (((_a = m.homeParticipant) === null || _a === void 0 ? void 0 : _a.participantID) || m.homeID || m.home_id || "").toString();
                        var awayId = (((_b = m.awayParticipant) === null || _b === void 0 ? void 0 : _b.participantID) || m.awayID || m.away_id || "").toString();
                        var _e = formatToWarsaw(m.matchDate || m.match_date, m.matchTime || m.match_time), date = _e.date, time = _e.time;
                        return __assign(__assign({}, m), { matchDate: date, matchTime: time, homeLogo: resolveTeamLogo(((_c = m.homeParticipant) === null || _c === void 0 ? void 0 : _c.logo) || m.homeLogo || m.home_logo || homeId), awayLogo: resolveTeamLogo(((_d = m.awayParticipant) === null || _d === void 0 ? void 0 : _d.logo) || m.awayLogo || m.away_logo || awayId) });
                    });
                    setCache(cacheKey, processed);
                    return [2 /*return*/, processed];
                case 3:
                    error_9 = _a.sent();
                    console.error('Get Upcoming Matches Action Error:', error_9);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getTeamRecentMatchesAction(teamId_1, seasonId_1) {
    return __awaiter(this, arguments, void 0, function (teamId, seasonId, teamName) {
        var client, allMatches, cleanTeamName_1, teamMatches, playedMatches, error_10;
        if (teamName === void 0) { teamName = ""; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    client = getStatoriumClient();
                    return [4 /*yield*/, client.getMatches(seasonId, teamId)];
                case 1:
                    allMatches = _a.sent();
                    cleanTeamName_1 = teamName.toLowerCase().trim();
                    teamMatches = allMatches.filter(function (m) {
                        var _a, _b, _c, _d;
                        var hId = (m.homeID || m.home_id || m.homeParticipantID || m.homeTeamID || m.home_participant_id || ((_a = m.homeParticipant) === null || _a === void 0 ? void 0 : _a.participantID) || "").toString();
                        var aId = (m.awayID || m.away_id || m.awayParticipantID || m.awayTeamID || m.away_participant_id || ((_b = m.awayParticipant) === null || _b === void 0 ? void 0 : _b.participantID) || "").toString();
                        var hName = (m.homeName || m.home_name || m.homeParticipantName || ((_c = m.homeParticipant) === null || _c === void 0 ? void 0 : _c.participantName) || "").toLowerCase();
                        var aName = (m.awayName || m.away_name || m.awayParticipantName || ((_d = m.awayParticipant) === null || _d === void 0 ? void 0 : _d.participantName) || "").toLowerCase();
                        return hId === teamId || aId === teamId || (cleanTeamName_1 && (hName.includes(cleanTeamName_1) || aName.includes(cleanTeamName_1)));
                    });
                    console.log("[Action] getTeamRecentMatches for team ".concat(teamId, ": found ").concat(teamMatches.length, " matches"));
                    playedMatches = teamMatches.filter(function (m) {
                        var _a, _b, _c, _d, _e, _f, _g, _h;
                        var hScore = (_c = (_b = (_a = m.homeScore) !== null && _a !== void 0 ? _a : m.home_score) !== null && _b !== void 0 ? _b : m.homeScore_chk) !== null && _c !== void 0 ? _c : (_d = m.homeParticipant) === null || _d === void 0 ? void 0 : _d.score;
                        var aScore = (_g = (_f = (_e = m.awayScore) !== null && _e !== void 0 ? _e : m.away_score) !== null && _f !== void 0 ? _f : m.awayScore_chk) !== null && _g !== void 0 ? _g : (_h = m.awayParticipant) === null || _h === void 0 ? void 0 : _h.score;
                        var mDate = new Date(m.matchDate || m.match_date || "1900-01-01");
                        var now = new Date();
                        return (hScore !== undefined && hScore !== null && hScore !== "") && mDate <= now;
                    });
                    // Sort by date descending (most recent first)
                    playedMatches.sort(function (a, b) {
                        var dateA = new Date("".concat(a.matchDate || a.match_date, " ").concat(a.matchTime || a.match_time || '00:00'));
                        var dateB = new Date("".concat(b.matchDate || b.match_date, " ").concat(b.matchTime || b.match_time || '00:00'));
                        return dateB.getTime() - dateA.getTime();
                    });
                    return [2 /*return*/, playedMatches.slice(0, 10).map(function (m) {
                            var _a, _b, _c, _d, _e, _f, _g, _h;
                            var _j = formatToWarsaw(m.matchDate || m.match_date, m.matchTime || m.match_time), date = _j.date, time = _j.time;
                            return {
                                matchID: m.matchID || m.match_id || m.id,
                                homeName: m.homeName || m.home_name || m.homeParticipantName,
                                awayName: m.awayName || m.away_name || m.awayParticipantName,
                                homeLogo: resolveTeamLogo(m.homeLogo || m.home_logo || m.homeID || m.home_id),
                                awayLogo: resolveTeamLogo(m.awayLogo || m.away_logo || m.awayID || m.away_id),
                                homeScore: (_d = (_b = (_a = m.homeScore) !== null && _a !== void 0 ? _a : m.home_score) !== null && _b !== void 0 ? _b : (_c = m.homeParticipant) === null || _c === void 0 ? void 0 : _c.score) !== null && _d !== void 0 ? _d : "?",
                                awayScore: (_h = (_f = (_e = m.awayScore) !== null && _e !== void 0 ? _e : m.away_score) !== null && _f !== void 0 ? _f : (_g = m.awayParticipant) === null || _g === void 0 ? void 0 : _g.score) !== null && _h !== void 0 ? _h : "?",
                                matchDate: date,
                                matchTime: time,
                                venue: m.venueName || m.venue_name || m.venue
                            };
                        })];
                case 2:
                    error_10 = _a.sent();
                    console.error('Get Team Recent Matches Error:', error_10);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getMatchDetailsAction(matchId) {
    return __awaiter(this, void 0, void 0, function () {
        var client, match, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    client = getStatoriumClient();
                    return [4 /*yield*/, client.getMatchDetails(matchId)];
                case 1:
                    match = _a.sent();
                    return [2 /*return*/, match];
                case 2:
                    error_11 = _a.sent();
                    console.error('Get Match Details Error:', error_11);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var TOP_LEAGUES = [
    { id: "515", name: "Premier League" },
    { id: "558", name: "La Liga" },
    { id: "511", name: "Serie A" },
    { id: "521", name: "Bundesliga" },
    { id: "519", name: "Ligue 1" },
];
function getTopLeaguesClubsAction() {
    return __awaiter(this, void 0, void 0, function () {
        var client_3, allClubs, results, _i, results_2, result, standings, leagueId, _a, _b, s, clubName, clubId, uniqueClubs, error_12;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    client_3 = getStatoriumClient();
                    allClubs = [];
                    return [4 /*yield*/, Promise.allSettled(TOP_LEAGUES.map(function (league) { return client_3.getStandings(league.id).then(function (data) { return ({ leagueId: league.id, data: data }); }); }))];
                case 1:
                    results = _d.sent();
                    for (_i = 0, results_2 = results; _i < results_2.length; _i++) {
                        result = results_2[_i];
                        if (result.status === 'fulfilled' && result.value) {
                            standings = result.value.data;
                            leagueId = result.value.leagueId;
                            for (_a = 0, _b = standings; _a < _b.length; _a++) {
                                s = _b[_a];
                                clubName = s.teamName || s.teamMiddleName;
                                clubId = (_c = s.teamID) === null || _c === void 0 ? void 0 : _c.toString();
                                allClubs.push({
                                    id: clubId,
                                    name: clubName,
                                    city: s.city || "",
                                    logo: s.logo || s.teamLogo || "",
                                    seasonId: leagueId
                                });
                            }
                        }
                    }
                    uniqueClubs = Array.from(new Map(allClubs.map(function (item) { return [item.id, item]; })).values());
                    return [2 /*return*/, uniqueClubs];
                case 2:
                    error_12 = _d.sent();
                    console.error('Get Top Leagues Clubs Action Error:', error_12);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getAllTop5ClubsAction() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, getTopLeaguesClubsAction()];
        });
    });
}
function getAllTop5PlayersAction() {
    return __awaiter(this, void 0, void 0, function () {
        var client, allPlayers, _i, TOP_LEAGUES_3, league, standings, topTeams, _loop_1, _a, _b, team, uniquePlayers, error_13;
        var _this = this;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 8, , 9]);
                    client = getStatoriumClient();
                    allPlayers = [];
                    _i = 0, TOP_LEAGUES_3 = TOP_LEAGUES;
                    _d.label = 1;
                case 1:
                    if (!(_i < TOP_LEAGUES_3.length)) return [3 /*break*/, 7];
                    league = TOP_LEAGUES_3[_i];
                    return [4 /*yield*/, client.getStandings(league.id)];
                case 2:
                    standings = _d.sent();
                    if (!(standings && standings.length > 0)) return [3 /*break*/, 6];
                    topTeams = standings.slice(0, 6);
                    _loop_1 = function (team) {
                        var tid, squadPlayers, enriched, e_7;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    tid = (_c = team.teamID) === null || _c === void 0 ? void 0 : _c.toString();
                                    if (!tid) return [3 /*break*/, 6];
                                    _e.label = 1;
                                case 1:
                                    _e.trys.push([1, 5, , 6]);
                                    return [4 /*yield*/, client.getPlayersByTeam(tid, league.id)];
                                case 2:
                                    squadPlayers = _e.sent();
                                    if (!(squadPlayers && squadPlayers.length > 0)) return [3 /*break*/, 4];
                                    return [4 /*yield*/, Promise.all(squadPlayers.slice(0, 5).map(function (p) { return __awaiter(_this, void 0, void 0, function () {
                                            var details, e_8;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        return [4 /*yield*/, getPlayerDetailsAction(p.playerID.toString())];
                                                    case 1:
                                                        details = _a.sent();
                                                        return [2 /*return*/, __assign(__assign(__assign({}, p), (details || {})), { teamName: team.teamName || team.teamMiddleName || "Elite Club", playerPhoto: resolvePlayerPhoto(p), stat: (details === null || details === void 0 ? void 0 : details.stat) || [] })];
                                                    case 2:
                                                        e_8 = _a.sent();
                                                        return [2 /*return*/, __assign(__assign({}, p), { teamName: team.teamName || team.teamMiddleName || "Elite Club", playerPhoto: resolvePlayerPhoto(p) })];
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); }))];
                                case 3:
                                    enriched = _e.sent();
                                    allPlayers.push.apply(allPlayers, enriched);
                                    _e.label = 4;
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    e_7 = _e.sent();
                                    console.warn("Could not fetch players for team ".concat(tid, " in season ").concat(league.id));
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    _a = 0, _b = topTeams;
                    _d.label = 3;
                case 3:
                    if (!(_a < _b.length)) return [3 /*break*/, 6];
                    team = _b[_a];
                    return [5 /*yield**/, _loop_1(team)];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    _a++;
                    return [3 /*break*/, 3];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    uniquePlayers = Array.from(new Map(allPlayers.map(function (p) { return [p.playerID, p]; })).values());
                    return [2 /*return*/, uniquePlayers.sort(function (a, b) { return (a.fullName || "").localeCompare(b.fullName || ""); })];
                case 8:
                    error_13 = _d.sent();
                    console.error('Get All Top 5 Players Error:', error_13);
                    return [2 /*return*/, []];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function getPlayerDetailsAction(playerId) {
    return __awaiter(this, void 0, void 0, function () {
        var localCachePath, cachedData, playerData, supabase, cachedPlayer, client, playerDetails, e_9, error_14;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!playerId)
                        return [2 /*return*/, null];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 9, , 10]);
                    localCachePath = path.join(process.cwd(), 'scratch', 'cache', "player_".concat(playerId, ".json"));
                    if (fs.existsSync(localCachePath)) {
                        try {
                            console.log("[getPlayerDetailsAction] \uD83C\uDFAF Using local harvested cache for player ".concat(playerId));
                            cachedData = JSON.parse(fs.readFileSync(localCachePath, 'utf8'));
                            playerData = cachedData.player || cachedData;
                            if (playerData && playerData.stat) {
                                return [2 /*return*/, {
                                        playerID: playerData.playerID || playerId,
                                        fullName: playerData.fullName || playerData.shortName,
                                        position: resolvePosition(playerData.position || ((_a = playerData.additionalInfo) === null || _a === void 0 ? void 0 : _a.position), playerId),
                                        photo: resolvePlayerPhoto(playerData),
                                        stat: playerData.stat || [],
                                        additionalInfo: playerData.additionalInfo || {}
                                    }];
                            }
                        }
                        catch (e) {
                            console.warn("[getPlayerDetailsAction] Failed to read local cache for ".concat(playerId));
                        }
                    }
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 2:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase
                            .from('cached_players')
                            .select('*')
                            .eq('id', playerId)
                            .single()];
                case 3:
                    cachedPlayer = (_d.sent()).data;
                    if (cachedPlayer) {
                        console.log("[Cache] Hit for player ".concat(playerId));
                        return [2 /*return*/, {
                                playerID: cachedPlayer.id,
                                fullName: cachedPlayer.full_name,
                                position: cachedPlayer.position,
                                photo: cachedPlayer.photo_url,
                                stat: cachedPlayer.stats,
                                additionalInfo: { birthdate: cachedPlayer.birthdate }
                            }];
                    }
                    client = getStatoriumClient();
                    console.log("[Action] Fetching details for player ".concat(playerId));
                    return [4 /*yield*/, client.getPlayerDetails(playerId)];
                case 4:
                    playerDetails = _d.sent();
                    if (!playerDetails) return [3 /*break*/, 8];
                    console.log("[Action] Player details received for ".concat(playerId, ", caching..."));
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, supabase.from('cached_players').upsert({
                            id: playerId,
                            full_name: playerDetails.fullName,
                            position: resolvePosition(playerDetails.position || ((_b = playerDetails.additionalInfo) === null || _b === void 0 ? void 0 : _b.position), playerId),
                            photo_url: resolvePlayerPhoto(playerDetails),
                            birthdate: ((_c = playerDetails.additionalInfo) === null || _c === void 0 ? void 0 : _c.birthdate) || '',
                            stats: playerDetails.stat || [],
                            last_synced: new Date().toISOString()
                        })];
                case 6:
                    _d.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_9 = _d.sent();
                    console.warn("[Action] Failed to cache player ".concat(playerId, ":"), e_9);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, playerDetails];
                case 9:
                    error_14 = _d.sent();
                    console.error("[Action] Get Player Details Error for player ".concat(playerId, ":"), error_14);
                    return [2 /*return*/, null];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function getPlayersByClubAction(teamId_1, seasonId_1) {
    return __awaiter(this, arguments, void 0, function (teamId, seasonId, includeFullDetails) {
        var client, reliableSeasonId, _i, TOP_LEAGUES_4, league, standings, found, e_10, teamDetails, teamName_1, error_15;
        if (includeFullDetails === void 0) { includeFullDetails = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!teamId)
                        return [2 /*return*/, []];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    client = getStatoriumClient();
                    reliableSeasonId = seasonId;
                    if (!!reliableSeasonId) return [3 /*break*/, 7];
                    _i = 0, TOP_LEAGUES_4 = TOP_LEAGUES;
                    _a.label = 2;
                case 2:
                    if (!(_i < TOP_LEAGUES_4.length)) return [3 /*break*/, 7];
                    league = TOP_LEAGUES_4[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, client.getStandings(league.id)];
                case 4:
                    standings = _a.sent();
                    found = standings.find(function (s) { var _a; return ((_a = s.teamID) === null || _a === void 0 ? void 0 : _a.toString()) === teamId; });
                    if (found) {
                        reliableSeasonId = league.id;
                        return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    e_10 = _a.sent();
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [4 /*yield*/, getTeamDetailsAction(teamId, reliableSeasonId)];
                case 8:
                    teamDetails = _a.sent();
                    if (!teamDetails || !teamDetails.players)
                        return [2 /*return*/, []];
                    teamName_1 = teamDetails.teamName || "Unknown Club";
                    if (includeFullDetails) {
                        // Return full enriched player data for search functionality
                        return [2 /*return*/, teamDetails.players.map(function (p) {
                                var _a, _b, _c, _d;
                                var fullName = p.fullName || "".concat(p.firstName, " ").concat(p.lastName);
                                var birthdate = ((_a = p.additionalInfo) === null || _a === void 0 ? void 0 : _a.birthdate) || "";
                                var age = birthdate ? calculateAgeFromBirthdate(birthdate) : "N/A";
                                return {
                                    playerID: p.playerID,
                                    id: p.playerID,
                                    fullName: fullName,
                                    name: fullName,
                                    position: resolvePosition(p.position || ((_b = p.additionalInfo) === null || _b === void 0 ? void 0 : _b.position), p.playerID),
                                    age: age,
                                    teamName: teamName_1,
                                    teamID: teamId,
                                    playerPhoto: resolvePlayerPhoto(p),
                                    photoUrl: resolvePlayerPhoto(p),
                                    photo: resolvePlayerPhoto(p),
                                    marketValue: "€" + (Math.floor(Math.random() * 80) + 5) + "M",
                                    height: ((_c = p.additionalInfo) === null || _c === void 0 ? void 0 : _c.height) || "N/A",
                                    weight: ((_d = p.additionalInfo) === null || _d === void 0 ? void 0 : _d.weight) || "N/A",
                                    additionalInfo: p.additionalInfo || {}
                                };
                            })];
                    }
                    else {
                        // Return simplified data for existing functionality
                        return [2 /*return*/, teamDetails.players.map(function (p) {
                                var _a;
                                var fullName = p.fullName || "".concat(p.firstName, " ").concat(p.lastName);
                                return {
                                    id: p.playerID,
                                    name: fullName,
                                    position: resolvePosition(p.position || ((_a = p.additionalInfo) === null || _a === void 0 ? void 0 : _a.position), p.playerID),
                                    marketValue: "€" + (Math.floor(Math.random() * 80) + 5) + "M",
                                    photoUrl: resolvePlayerPhoto(p)
                                };
                            })];
                    }
                    return [3 /*break*/, 10];
                case 9:
                    error_15 = _a.sent();
                    console.error('Get Players By Club Action Error:', error_15);
                    return [2 /*return*/, []];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Helper function to calculate age from birthdate
function calculateAgeFromBirthdate(birthdate) {
    if (!birthdate)
        return "N/A";
    try {
        // Birthdate format: "DD-MM-YYYY (Age)" or similar
        var match = birthdate.match(/(\d{2})-(\d{2})-(\d{4})/);
        if (!match)
            return "N/A";
        var day = match[1], month = match[2], year = match[3];
        var birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        var today = new Date();
        var age = today.getFullYear() - birthDate.getFullYear();
        var monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    }
    catch (e) {
        return "N/A";
    }
}
function getTransfersAction() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                return [2 /*return*/, statorium_data_1.VERIFIED_TRANSFERS];
            }
            catch (error) {
                console.error('Get Transfers Action Error:', error);
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    });
}
function getPlayersAction(teamId, seasonId) {
    return __awaiter(this, void 0, void 0, function () {
        var client, players, error_16;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    client = getStatoriumClient();
                    return [4 /*yield*/, client.getPlayersByTeam(teamId, seasonId)];
                case 1:
                    players = _a.sent();
                    return [2 /*return*/, players || []];
                case 2:
                    error_16 = _a.sent();
                    console.error('Get Players Action Error:', error_16);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getTeamLogoAction(teamName, leagueId, teamId) {
    return __awaiter(this, void 0, void 0, function () {
        var client, targetLeagues, _i, targetLeagues_1, id, standings, team, error_17;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    client = getStatoriumClient();
                    targetLeagues = leagueId ? [leagueId] : ["558", "515", "521", "511", "519"];
                    _i = 0, targetLeagues_1 = targetLeagues;
                    _a.label = 1;
                case 1:
                    if (!(_i < targetLeagues_1.length)) return [3 /*break*/, 4];
                    id = targetLeagues_1[_i];
                    return [4 /*yield*/, client.getStandings(id)];
                case 2:
                    standings = _a.sent();
                    team = standings.find(function (s) {
                        var _a, _b, _c;
                        return (teamId && String(s.teamID) === String(teamId)) ||
                            ((_a = s.teamName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(teamName.toLowerCase())) ||
                            ((_b = s.teamMiddleName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(teamName.toLowerCase())) ||
                            teamName.toLowerCase().includes((_c = s.teamName) === null || _c === void 0 ? void 0 : _c.toLowerCase());
                    });
                    if ((team === null || team === void 0 ? void 0 : team.logo) || (team === null || team === void 0 ? void 0 : team.teamLogo))
                        return [2 /*return*/, team.logo || team.teamLogo];
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, null];
                case 5:
                    error_17 = _a.sent();
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getPlayerFullDataAction(playerId) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, url, response, errorText, data, playerData, error_18;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!playerId)
                        return [2 /*return*/, null];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    apiKey = process.env.STATORIUM_API_KEY;
                    url = "https://api.statorium.com/v1/?a=player&playerID=".concat(playerId, "&apikey=").concat(apiKey);
                    console.log("[getPlayerFullDataAction] Fetching full data for player ".concat(playerId));
                    console.log("[getPlayerFullDataAction] URL: ".concat(url));
                    return [4 /*yield*/, fetch(url, {
                            next: { revalidate: 3600 },
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    errorText = _a.sent();
                    console.error("[getPlayerFullDataAction] API Error ".concat(response.status, ":"), errorText);
                    throw new Error("Statorium API error: ".concat(response.status, " ").concat(response.statusText));
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    console.log("[getPlayerFullDataAction] Full data received:", JSON.stringify(data, null, 2));
                    playerData = data.player || data;
                    if (!playerData) {
                        console.warn("[getPlayerFullDataAction] No player data found in response");
                        return [2 /*return*/, null];
                    }
                    console.log("[getPlayerDataAction] Player stat array:", playerData.stat);
                    return [2 /*return*/, playerData];
                case 6:
                    error_18 = _a.sent();
                    console.error("[getPlayerDataAction] Error for player ".concat(playerId, ":"), error_18);
                    return [2 /*return*/, null];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function getPlayerDataAction(playerId_1) {
    return __awaiter(this, arguments, void 0, function (playerId, timeoutMs) {
        var startTime, timestamp, localCachePath, cachedData, playerData, apiKey, url, controller_1, timeoutId, response, errorText, data, elapsed, playerData, serialized, deserialized, error_19, elapsed, error_20, elapsed;
        var _a;
        if (timeoutMs === void 0) { timeoutMs = 10000; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!playerId)
                        return [2 /*return*/, null];
                    startTime = Date.now();
                    timestamp = Date.now();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, , 10]);
                    localCachePath = path.join(process.cwd(), 'scratch', 'cache', "player_".concat(playerId, ".json"));
                    if (fs.existsSync(localCachePath)) {
                        try {
                            console.log("[getPlayerDataAction] \uD83C\uDFAF Using local harvested cache for player ".concat(playerId));
                            cachedData = JSON.parse(fs.readFileSync(localCachePath, 'utf8'));
                            playerData = cachedData.player || cachedData;
                            if (playerData && playerData.stat) {
                                return [2 /*return*/, playerData];
                            }
                        }
                        catch (e) {
                            console.warn("[getPlayerDataAction] Failed to read local cache for ".concat(playerId, ", falling back to API"));
                        }
                    }
                    apiKey = process.env.STATORIUM_API_KEY;
                    url = "https://api.statorium.com/api/v1/players/".concat(playerId, "/?apikey=").concat(apiKey, "&showstat=true&_t=").concat(timestamp);
                    console.log("[getPlayerDataAction] Fetching detailed data for player ".concat(playerId));
                    console.log("[getPlayerDataAction] URL: ".concat(url));
                    console.log("[getPlayerDataAction] Timeout: ".concat(timeoutMs, "ms"));
                    controller_1 = new AbortController();
                    timeoutId = setTimeout(function () {
                        controller_1.abort();
                        var elapsed = Date.now() - startTime;
                        console.error("[getPlayerDataAction] Timeout after ".concat(elapsed, "ms for player ").concat(playerId));
                    }, timeoutMs);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, fetch(url, {
                            next: { revalidate: 3600 },
                            signal: controller_1.signal,
                        })];
                case 3:
                    response = _b.sent();
                    // Clear timeout on successful response
                    clearTimeout(timeoutId);
                    if (!!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.text()];
                case 4:
                    errorText = _b.sent();
                    console.error("[getPlayerDataAction] API Error ".concat(response.status, ":"), errorText);
                    throw new Error("Statorium API error: ".concat(response.status, " ").concat(response.statusText));
                case 5: return [4 /*yield*/, response.json()];
                case 6:
                    data = _b.sent();
                    elapsed = Date.now() - startTime;
                    console.log("[getPlayerDataAction] Request completed in ".concat(elapsed, "ms"));
                    console.log("[getPlayerDataAction] Full data structure keys:", Object.keys(data));
                    console.log("[getPlayerDataAction] Has player property:", !!data.player);
                    console.log("[getPlayerDataAction] Has stat property on data:", !!data.stat);
                    playerData = data.player || data;
                    if (!playerData) {
                        console.warn("[getPlayerDataAction] No player data found in response");
                        return [2 /*return*/, null];
                    }
                    console.log("[getPlayerDataAction] Player data keys:", Object.keys(playerData));
                    console.log("[getPlayerDataAction] Has stat property on playerData:", !!playerData.stat);
                    console.log("[getPlayerDataAction] Player stat array:", playerData.stat);
                    console.log("[getPlayerDataAction] Stat array length:", ((_a = playerData.stat) === null || _a === void 0 ? void 0 : _a.length) || 0);
                    console.log("[getPlayerDataAction] Stat array type:", typeof playerData.stat);
                    console.log("[getPlayerDataAction] Stat array is array:", Array.isArray(playerData.stat));
                    // Log first season for debugging
                    if (playerData.stat && playerData.stat.length > 0) {
                        console.log("[getPlayerDataAction] First season:", JSON.stringify(playerData.stat[0], null, 2));
                        console.log("[getPlayerDataAction] First season keys:", Object.keys(playerData.stat[0]));
                    }
                    console.log("[getPlayerDataAction] \u2705 Returning playerData with stat array");
                    console.log("[getPlayerDataAction] \u2705 Return value has stat:", !!playerData.stat);
                    // Test serialization to ensure data can be transmitted
                    try {
                        serialized = JSON.stringify(playerData);
                        console.log("[getPlayerDataAction] \u2705 Serialization test successful, length:", serialized.length);
                        deserialized = JSON.parse(serialized);
                        console.log("[getPlayerDataAction] \u2705 Deserialization test successful, has stat:", !!deserialized.stat);
                    }
                    catch (error) {
                        console.error("[getPlayerDataAction] \u274C Serialization test failed:", error);
                    }
                    return [2 /*return*/, playerData];
                case 7:
                    error_19 = _b.sent();
                    // Clear timeout on error
                    clearTimeout(timeoutId);
                    elapsed = Date.now() - startTime;
                    // Check if it's an abort (timeout)
                    if (error_19 instanceof Error && error_19.name === 'AbortError') {
                        console.error("[getPlayerDataAction] Request timeout for player ".concat(playerId, " after ").concat(elapsed, "ms"));
                        throw new Error("Request timeout after ".concat(timeoutMs, "ms"));
                    }
                    throw error_19;
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_20 = _b.sent();
                    elapsed = Date.now() - startTime;
                    console.error("[getPlayerDataAction] Error for player ".concat(playerId, " after ").concat(elapsed, "ms:"), error_20);
                    if (error_20 instanceof Error) {
                        console.error("[getPlayerDataAction] Error type:", error_20.constructor.name);
                        console.error("[getPlayerDataAction] Error message:", error_20.message);
                    }
                    return [2 /*return*/, null];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function getTopScorersAction(seasonId) {
    return __awaiter(this, void 0, void 0, function () {
        var client, scorers, processedScorers, error_21;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    client = getStatoriumClient();
                    return [4 /*yield*/, client.getTopScorers(seasonId)];
                case 1:
                    scorers = _a.sent();
                    processedScorers = scorers.filter(function (s) {
                        var pos = resolvePosition(s.position || s.positionID);
                        return pos === "FW";
                    }).map(function (s) { return ({
                        playerID: s.playerID,
                        fullName: s.fullName,
                        goals: parseInt(s.goals || "0"),
                        teamName: s.teamName,
                        teamID: s.teamID,
                        photo: resolvePlayerPhoto(s)
                    }); });
                    return [2 /*return*/, processedScorers.sort(function (a, b) { return b.goals - a.goals; }).slice(0, 10)];
                case 2:
                    error_21 = _a.sent();
                    console.error('Get Top Scorers Action Error:', error_21);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * HIGH-PERFORMANCE SERVER ACTION
 * Offloads all complex parsing, seasonal prioritization and rating logic to the server.
 * This prevents main-thread blocking on the client and ensures a snappy UI.
 */
function getEnrichedPlayerDataAction(playerId, initialData) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, realData, parseStat_1, extractStat, parseYear_1, maxYear_1, currentSeasons, goals, assists, matches, _i, currentSeasons_1, season, currentSeason, rating, pos, enriched, elapsed, error_22, elapsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = Date.now();
                    console.log("[getEnrichedPlayerDataAction] Starting for player ".concat(playerId));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    if (!playerId || playerId === '1') {
                        console.log("[getEnrichedPlayerDataAction] Invalid ID ".concat(playerId, ", returning initial data"));
                        return [2 /*return*/, initialData];
                    }
                    return [4 /*yield*/, getPlayerDetailsAction(playerId)];
                case 2:
                    realData = _a.sent();
                    if (!realData || !realData.stat || realData.stat.length === 0) {
                        console.log("[getEnrichedPlayerDataAction] No real data found for ".concat(playerId));
                        return [2 /*return*/, initialData];
                    }
                    parseStat_1 = function (val) {
                        if (typeof val === 'string') {
                            var match = val.match(/\d+/);
                            return match ? parseInt(match[0]) : 0;
                        }
                        return typeof val === 'number' ? val : parseInt(val || '0');
                    };
                    extractStat = function (obj, primaryKey, secondaryKeys) {
                        if (secondaryKeys === void 0) { secondaryKeys = []; }
                        if (!obj)
                            return 0;
                        var allKeys = __spreadArray([primaryKey], secondaryKeys, true);
                        for (var _i = 0, allKeys_1 = allKeys; _i < allKeys_1.length; _i++) {
                            var key = allKeys_1[_i];
                            var val = parseStat_1(obj[key]);
                            if (val > 0)
                                return val;
                        }
                        if (primaryKey === 'goals' || primaryKey === 'goalscore') {
                            var home = parseStat_1(obj.goals_home || obj.goalscore_home);
                            var away = parseStat_1(obj.goals_away || obj.goalscore_away);
                            if (home + away > 0)
                                return home + away;
                        }
                        return 0;
                    };
                    parseYear_1 = function (s) {
                        var name = s.season_name || s.seasonName || '';
                        var match = name.match(/20\d{2}/);
                        return match ? parseInt(match[0]) : 0;
                    };
                    maxYear_1 = Math.max.apply(Math, realData.stat.map(parseYear_1));
                    currentSeasons = realData.stat.filter(function (s) { return parseYear_1(s) === maxYear_1; });
                    goals = 0;
                    assists = 0;
                    matches = 0;
                    for (_i = 0, currentSeasons_1 = currentSeasons; _i < currentSeasons_1.length; _i++) {
                        season = currentSeasons_1[_i];
                        goals += extractStat(season, 'Goals', ['goals', 'goalscore', 'goals_total', 'Goal']);
                        assists += extractStat(season, 'Assist', ['assists', 'assists_total']);
                        matches += parseStat_1(season.played || season.appearances || 0);
                    }
                    if (currentSeasons.length === 0 && realData.stat.length > 0) {
                        currentSeason = realData.stat[0];
                        goals = extractStat(currentSeason, 'Goals', ['goals', 'goalscore', 'goals_total', 'Goal']);
                        assists = extractStat(currentSeason, 'Assist', ['assists', 'assists_total']);
                        matches = parseStat_1(currentSeason.played || currentSeason.appearances || 0);
                    }
                    rating = 70;
                    pos = (initialData.position || '').toUpperCase();
                    if (pos === 'ST' || pos === 'FW') {
                        rating += (goals * 2) + (assists * 1.5);
                    }
                    else if (pos === 'MF' || pos === 'CAM') {
                        rating += (goals * 1.5) + (assists * 2.5);
                    }
                    else {
                        rating += (goals * 3) + (assists * 2);
                    }
                    // Normalize rating to 65-98 range
                    rating = Math.min(98, Math.max(65, Math.round(rating)));
                    enriched = __assign(__assign({}, initialData), { id: playerId, stats: __assign(__assign({}, initialData.stats), { offensive: __assign(__assign({}, initialData.stats.offensive), { goals: goals, assists: assists }) }), rating: rating, matches: matches, normalizedStats: {
                            offensive: Math.min(100, (goals * 10) + (assists * 5) + 60),
                            defensive: initialData.stats.defensive.tackles,
                            tactical: initialData.stats.tactical.progressivePasses,
                            physical: initialData.stats.physical.stamina,
                            dribbling: initialData.stats.tactical.dribbles,
                            passing: initialData.stats.tactical.passAccuracy
                        } });
                    elapsed = Date.now() - startTime;
                    console.log("[getEnrichedPlayerDataAction] Successfully enriched player ".concat(playerId, " in ").concat(elapsed, "ms"));
                    return [2 /*return*/, enriched];
                case 3:
                    error_22 = _a.sent();
                    elapsed = Date.now() - startTime;
                    console.error("[getEnrichedPlayerDataAction] Error for player ".concat(playerId, " after ").concat(elapsed, "ms:"), error_22);
                    return [2 /*return*/, initialData];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Optimized action to fetch both standings and upcoming matches for the League Hub in one request.
 */
function getLeagueHubDataAction(seasonId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, standings, fixtures, error_23;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            getStandingsAction(seasonId),
                            getUpcomingMatchesAction(seasonId, 4)
                        ])];
                case 1:
                    _a = _b.sent(), standings = _a[0], fixtures = _a[1];
                    return [2 /*return*/, {
                            standings: standings || [],
                            fixtures: fixtures || []
                        }];
                case 2:
                    error_23 = _b.sent();
                    console.error("[Action] getLeagueHubDataAction error for ".concat(seasonId, ":"), error_23);
                    return [2 /*return*/, { standings: [], fixtures: [] }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Optimized action to fetch enriched data for two players at once for the Comparison module.
 */
function getComparisonDataAction(p1Id, p2Id) {
    return __awaiter(this, void 0, void 0, function () {
        var promises, _a, p1Data, p2Data, error_24;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    promises = [];
                    if (p1Id)
                        promises.push(getEnrichedPlayerDataAction(p1Id));
                    else
                        promises.push(Promise.resolve(null));
                    if (p2Id)
                        promises.push(getEnrichedPlayerDataAction(p2Id));
                    else
                        promises.push(Promise.resolve(null));
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    _a = _b.sent(), p1Data = _a[0], p2Data = _a[1];
                    return [2 /*return*/, {
                            player1: p1Data,
                            player2: p2Data
                        }];
                case 2:
                    error_24 = _b.sent();
                    console.error("[Action] getComparisonDataAction error:", error_24);
                    return [2 /*return*/, { player1: null, player2: null }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
