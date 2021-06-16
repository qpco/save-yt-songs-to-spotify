
// gets video title from Youtube api
async function getVidTitle(accessToken) {
  let tab = await browser.tabs.query({currentWindow: true, active: true})  
  let url = 'https://www.youtube.com/oembed?url=' + tab[0].url + '&format=json'
  let promise = await fetch(url)
  let data = await promise.json()
  vidTitle = data.title;

  searchParam = vidTitle.replace(/[()]/g,''); // remove parentheses
  searchParam = searchParam.replace(/[[]]/g,''); // remove brackets
  searchParam = searchParam.replace(/[^a-zA-Z0-9]/g,' '); // remove all special characters
  searchParam = searchParam.replace(/lyrics/gi, '');
  searchParam = searchParam.replace(/official/gi, '');
  searchParam = searchParam.replace(/video/gi, '');
  searchParam = searchParam.replace(/version/gi, '');
  searchParam = searchParam.replace(/cover/gi, '');
  searchParam = searchParam.replace(/nightcore/gi, '');
  searchParam = searchParam.replace(/hd/gi, '');
  searchParam = searchParam.replace(/hq/gi, '');

  getSpotifyInfo(accessToken, vidTitle, searchParam);
} // getVidTitle

// request info from Spotify api
async function getSpotifyInfo(accessToken) {
  let promise = await fetch('https://api.spotify.com/v1/search?q='+searchParam+'&type=track&limit=3', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  });
  let data = await promise.json()
  if (data.tracks == undefined) {
    console.log(JSON.stringify(data))
  }
  if (data.tracks.items[0] === undefined) {
    console.log('no song found')
    document.getElementById('song-not-found').innerHTML = 'No song found'
    let refineSearchBtn = document.createElement('button')
    refineSearchBtn.innerHTML = 'Refine search'
    document.getElementById('refine-search-btn').appendChild(refineSearchBtn)
    document.getElementById('refine-search-btn').addEventListener('click', refineSearch.bind(null, accessToken, refineSearchBtn))
  } else {
    document.getElementById('content').style.width = '500px'
  }
  if (data.tracks.items.length >= 1) {
    document.getElementById('song-not-found').innerHTML = ''
    let t = document.getElementById('refine-search-btn')
    t.parentNode.removeChild(t)
    document.getElementById('track').innerHTML = 'TRACK'
    document.getElementById('artist').innerHTML = 'ARTIST'

    document.getElementById('track1').innerHTML = data.tracks.items[0].name
    document.getElementById('artist1').innerHTML = data.tracks.items[0].album.artists[0].name
    let trackID1 = data.tracks.items[0].id
    let btn1 = document.createElement('button')
    btn1.innerHTML = '+';
    document.getElementById('add1').appendChild(btn1)
    document.getElementById('add1').addEventListener('click', addToLibrary.bind(null, accessToken, trackID1))
  }
  if (data.tracks.items.length >= 2) {
    document.getElementById('track2').innerHTML = data.tracks.items[1].name
    document.getElementById('artist2').innerHTML = data.tracks.items[1].album.artists[0].name
    let trackID2 = data.tracks.items[1].id
    let btn2 = document.createElement('button')
    btn2.innerHTML = '+'
    document.getElementById('add2').appendChild(btn2)
    document.getElementById('add2').addEventListener('click', addToLibrary.bind(null, accessToken, trackID2))
  }
  if (data.tracks.items.length == 3) {
    document.getElementById('track3').innerHTML = data.tracks.items[2].name
    document.getElementById('artist3').innerHTML = data.tracks.items[2].album.artists[0].name
    let trackID3 = data.tracks.items[2].id
    let btn3 = document.createElement('button')
    btn3.innerHTML = '+';
    document.getElementById('add3').appendChild(btn3)
    document.getElementById('add3').addEventListener('click', addToLibrary.bind(null, accessToken, trackID3))
  }
} // getSpotifyInfo

// modify video title for better search results
function refineSearch(accessToken, refineSearchBtn) {
  searchParam = vidTitle.replace(/ *\([^)]*\) */g, ''); // remove text in parentheses
  searchParam = searchParam.replace(/ *\[[^\]]*]/g, ''); // remove text in brackets
  searchParam = searchParam.replace(/[^a-zA-Z0-9]/g,' '); // remove all special characters
  searchParam = searchParam.replace(/lyrics/gi, '');
  searchParam = searchParam.replace(/official/gi, '');
  searchParam = searchParam.replace(/video/gi, '');
  searchParam = searchParam.replace(/version/gi, '');
  searchParam = searchParam.replace(/cover/gi, '');
  searchParam = searchParam.replace(/nightcore/gi, '');
  searchParam = searchParam.replace(/hd/gi, '');
  searchParam = searchParam.replace(/hq/gi, '');
  
  document.getElementById('refine-search-btn').removeChild(refineSearchBtn)
  document.getElementById('song-not-found').innerHTML = ''
  getSpotifyInfo(accessToken, searchParam)
}

// send access token and track ID to Spotify API to add song to users' library
async function addToLibrary(accessToken, trackID) {
  let ID = [String(trackID)]
  let payload = {
    ids: ID
  }
  let promise = await fetch('https://api.spotify.com/v1/me/tracks', {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  switch(promise.status) {
    case 200:
      alert('Song added to your library.'); break;
    default:
      alert('Could not add song.'); break;
  }
} // addToLibrary