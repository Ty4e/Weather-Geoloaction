window.addEventListener("DOMContentLoaded", domLoaded);

function domLoaded() {
   document.getElementById("GeolocationBtn").addEventListener("click", GeolocationBtnClick);
   document.getElementById("city1").addEventListener("input", cityInput);
  
}

// Called city input values change
function cityInput(e) {
   //  city input that andthe callback
   const cityId = e.target.id;
   const city = document.getElementById(cityId).value.trim();
   
   //error  no city 
   if (city.length === 0) {
      showElement("error-value-" + cityId);
   }
   else {
      hideElement("error-value-" + cityId);
   }
}

// Geolocation butto
function GeolocationBtnClick() {
   // Get user input
   const city1 = document.getElementById("city1").value.trim();
 

   // city  left blank
   if (city1.length === 0) {
      showElement("error-value-city1");
   }
  

   // Must
   if (city1.length > 0) {
      showElement("forecast");
      hideElement("error-loading-city1");
      
      showElement("loading-city1");
      showText("loading-city1", `Loading ${city1}...`);
      
      
      hideElement("results-city1");
     

      // Fetch forecasts
      getWeatherForecast(city1, "city1");
      
   }
}

// Request city forecast
function getWeatherForecast(city, cityId) {
   // Create a URL to access the web API
   const endpoint = "https://api.openweathermap.org/data/2.5/forecast";
   const apiKey = "1307007a7da1aeb5b59930a312a42cd3";
   const queryString = `q=${encodeURI(city)}&units=imperial&appid=${apiKey}`;
   const url = `${endpoint}?${queryString}`;

   // Use XMLHttpRequest to make http request to web API
   const xhr = new XMLHttpRequest();

   // Call responseReceived() when response is received 
   xhr.addEventListener("load", function () {
      responseReceived(xhr, cityId, city);
   });

   // JSON response needs to be converted into an object
   xhr.responseType = "json";

   // Send request
   xhr.open("GET", url);
   xhr.send();
}

// Show forecast received from JSON  
function responseReceived(xhr, cityId, city) {
   // Loading
   hideElement("loading-" + cityId);

   // 200 status indicates forecast successfully received
   if (xhr.status === 200) {
      showElement("results-" + cityId);

      const cityName = xhr.response.city.name;
      showText(cityId + "-name", cityName);

      // Get 5 day forecast map
      const forecast = getSummaryForecast(xhr.response.list);

      // Put forecast into the city's table
      let day = 1;
      for (const date in forecast) {
         // Only process the first 5 days
         if (day <= 5) {
            showText(`${cityId}-day${day}-name`, getDayName(date));
            showText(`${cityId}-day${day}-high`, Math.round(forecast[date].high) + "&deg;");
            showText(`${cityId}-day${day}-low`, Math.round(forecast[date].low) + "&deg;");
            showImage(`${cityId}-day${day}-image`, forecast[date].weather);
         }
         day++;
      }
   } else {
      // Display appropriate error message
      const errorId = "error-loading-" + cityId;
      showElement(errorId);
      showText(errorId, `Unable to load city "${city}".`);
   }
}

// Return objects that contain the high temp, low temp, and weather for the next 5 days
function getSummaryForecast(forecastList) {  
   // storing high, low, weather
   const forecast = [];
   
   // Determine high and low for each day
   forecastList.forEach(function (item) {
      // Extract just the yyyy-mm-dd 
      const date = item.dt_txt.substr(0, 10);
      
      // temperature
      const temp = item.main.temp;

     //
      if (date in forecast) {         
         // Determine if the temperature is a new low or high
         if (temp < forecast[date].low) {
            forecast[date].low = temp;
         }
         if (temp > forecast[date].high) {
            forecast[date].high = temp;
         }
      }
      else {
         // Initialize new forecast
         const temps = {
            high: temp,
            low: temp,
            weather: item.weather[0].main
         };   
         
         // Add entry to map 
         forecast[date] = temps;
      }
   });
   
   return forecast;
}

// Convert date string into Mon, Tue, etc.
function getDayName(dateStr) {
   const date = new Date(dateStr);
   return date.toLocaleDateString("en-US", { weekday: 'short', timeZone: 'UTC' });
}

// Show the element
function showElement(elementId) {
   document.getElementById(elementId).classList.remove("hidden");
}

// Hide the element
function hideElement(elementId) {
   document.getElementById(elementId).classList.add("hidden");
}

// Display the text in the element
function showText(elementId, text) {
   document.getElementById(elementId).innerHTML = text;
}

// Show the weather image that matches the weatherType
function showImage(elementId, weatherType) {   
   // Images for various weather types
   const weatherImages = {
      Clear: "clear.png",
      Clouds: "clouds.png",
      Drizzle: "drizzle.png",
      Mist: "mist.png",
      Rain: "rain.png",
      Snow: "snow.png"
   };

   const imgUrl = "https://s3-us-west-2.amazonaws.com/static-resources.zybooks.com/";
   const img = document.getElementById(elementId);
   img.src = imgUrl + weatherImages[weatherType];
   img.alt = weatherType;
}
