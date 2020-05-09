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

streetListSec.addEventListener(`click`, event => {
  if (event.target.tagName === `A`) {
    stopSearch(event.target.dataset.streetKey);
  }
})

function retrieveStreetList(keyword) {
  fetch(`https://api.winnipegtransit.com/v3/streets.json?api-key=${apiKey}&name=${keyword}&usage=long`)
    .then(data => {
      if (data.ok) {
        return data.json();
      } else {
        throw new Error(`Fail to retrieve data.`);
      }
    })
    .then(streetList => displayStreetList(streetList.streets));
}

function displayStreetList(streetList) {
  let html = ``;

  if (streetList.length === 0) {
    html = `No results were found.`;
  } else {
    streetList.forEach(street => {
      html += `<a href="#" data-street-key="${street.key}">${street.name}</a>`;
    });
  }

  streetListSec.innerHTML = html;
}

function stopSearch(streetKey) {
  fetch(`https://api.winnipegtransit.com/v3/stops.json?api-key=${apiKey}&street=${streetKey}`)
    .then(data => {
      if (data.ok) {
        return data.json();
      } else {
        throw new Error(`Fail to retrieve data.`);
      }
    })
    .then(stopList => {
      const stopSchedule = [];
      stopList.stops.forEach(stop => {
        stopSchedule.push(fetch(`https://api.winnipegtransit.com/v3/stops/${stop.key}/schedule.json?api-key=${apiKey}`)
          .then(data => {
            if (data.ok) {
              return data.json();
            } else {
              throw new Error(`Fail to retrieve data.`);
            }
          })
          .then(result => {
            return result[`stop-schedule`];
          })
          )
      })
      Promise.all(stopSchedule).then(data => console.log(data));
    })
}