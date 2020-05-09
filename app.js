const apiKey = `G0ZNynR9C1I5fFkrMET`;
const searchForm = document.querySelector(`form`);
const inputArea = document.querySelector(`input`);
const streetListSec = document.querySelector(`.streets`);

searchForm.addEventListener(`submit`, event => {
  if (inputArea.value !== ``) {
    retrieveStreetList(inputArea.value);
  }

  inputArea.value = ``;
  event.preventDefault();
})

function retrieveStreetList(keyword) {
  fetch(`https://api.winnipegtransit.com/v3/streets.json?api-key=${apiKey}&name=${keyword}`)
    .then(result => {
      if (result.ok) {
        return result.json();
      } else {
        throw new Error `Fail to retrieve data.`;
      }
    })
    .then(data => displayStreetList(data.streets));
}

function displayStreetList(streetList) {
  let html = ``;
  streetList.forEach(street => {
    html += `<a href="#" data-street-key="${street.key}">${street.name}</a>`;
  });
  streetListSec.innerHTML = html;
}