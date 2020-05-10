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
    document.querySelector(`#street-name`).innerText = `Displaying results for "${event.target.innerText}"`;
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
        stopSchedule.push(fetch(`https://api.winnipegtransit.com/v3/stops/${stop.key}/schedule.json?api-key=${apiKey}&max-results-per-route=2`)
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
      Promise.all(stopSchedule).then(stopScheduleList => {
        displayStopSchedule(stopScheduleList);
      });
    })
}

function displayStopSchedule(stopScheduleList) {
  const scheduleTable = document.querySelector(`tbody`);
  let html = ``;
  stopScheduleList.forEach(stop => {
    stop[`route-schedules`].forEach(route => {
      route[`scheduled-stops`].forEach(time => {
        if (time.times.arrival !== undefined) {
          const originalTime = new Date(time.times.arrival.estimated);
          const timeOption = { hour: '2-digit', minute: '2-digit' };
          const formattedTime = originalTime.toLocaleTimeString([], timeOption);

          html += `
            <tr>
              <td>${stop.stop.street.name}</td>
              <td>${stop.stop[`cross-street`].name}</td>
              <td>${stop.stop.direction}</td>
              <td>${route.route.key}</td>
              <td>${formattedTime}</td>
            </tr>
          `;
        } 
      })
    })
  })

  scheduleTable.innerHTML = html;
}