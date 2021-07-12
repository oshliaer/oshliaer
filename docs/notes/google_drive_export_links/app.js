const getUrl = (id, range, key) =>
  `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}?key=${key}`;
const arrToCollect = (array) =>
  array
    .slice(1)
    .map(
      (_, ri) =>
        array[0].reduce((ah, h, ci) => ((ah[h] = array[ri + 1][ci]), ah), {}),
      []
    );

(async () => {
  const id = '1xTXNtfabGIiFR9PdOQonmnlSPbhGcj_2Geo1v0cq4Gw';
  const range = 'Sheet';
  const key = 'AIzaSyCt4F7Z8cVDqivNcO3slXewThZurJ4gJNY'; // Limited to the use of the contributor.pw/* domain
  let res = {};
  try {
    res = await fetch(getUrl(id, range, key));
    const data = JSON.parse(await res.text());
    console.log(data.values);
    console.log(arrToCollect(data.values));
  } catch (err) {
    console.error(err);
  }
})();
