function fetchData(method, url) {
    const promise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);

        xhr.onload = () => resolve(JSON.parse(xhr.response));
        xhr.onerror = () => reject(xhr.statusText);

        xhr.send();
    })

    return promise;
}

const key = '03fb54ebf904aeecf7fbb0e169f0c7ad';
const urlWeather = `https://api.openweathermap.org/data/2.5/weather?q=Minsk&appid=${key}`;
const urlWeather5 = `https://api.openweathermap.org/data/2.5/forecast?q=Minsk&appid=${key}`;
const kelvin = 273.15;
const content = document.querySelector('.contentUp');
const sectionNode = document.createElement('section');

class Weather {
	constructor(data) {
        [this.data, this.data2] = data;
        this.city = this.data.name;
        this.state = this.data.sys.country;
        this.temp = this._createTempInDeg();
        this.tempFeelsLike = this._createFeelsTempInDeg();
        this.time = this._addTime();
        this.windDeg = this._createValueForWindDeg();
        this.windSpeed = this.data.wind.speed;
        this.icon = this.data.weather[0].icon;

        this.list = this.data2.list;
        this.listDays = this._timeFilter();
    }
    
    _getRightMinutes(minute) {
        if (minute < 10) {
            minute = "0" + minute;
        }
        return minute;
    }

    _getWindDirection() {
        if (this.data.wind.deg <= 45) return "North";
        if (this.data.wind.deg <= 135) return "East";
        if (this.data.wind.deg <= 270) return "South";
        if (this.data.wind.deg <= 315) return "West";
        if (this.data.wind.deg <= 360) return "North";
    }

    _createValueForWindDeg() {
        const windDeg = this._getWindDirection();
        return windDeg;
    }

    _createTempInDeg() {
        return Math.round(this.data.main.temp - kelvin);
    }

    _createFeelsTempInDeg() {
        return Math.round(this.data.main.feels_like - kelvin);
    }

    _addTime() {
        return new Date(this.data.dt * 1000).getHours() + ':' + this._getRightMinutes(new Date(this.data.dt * 1000).getMinutes());
    }

    _timeFilter() {
        const listDays = this.list.filter((item) => {
            return item.dt_txt.toLowerCase().trim().includes("12:00:00");
        })
        return listDays;
    } 

    _dtDayForecast(day) {
  		return new Date(day).getDate();
    }
            
    _dtMonthForecast(month) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthIndex = new Date(month).getMonth();
        
        return months[monthIndex];
    }

    firstRender() {
    const template = `
        <header>
            <div class="place_time">
                <p>${this.city}, ${this.state}</p>
                <p><i class="far fa-clock"></i> ${this.time}</p>
            </div>
            <div class="temperature">
                <img src="http://openweathermap.org/img/wn/${this.icon}@2x.png" class="img-big">
    
                <p style="font-size:28px;">${this.temp} °С</p>
                <p style="font-size:16px;">Feels like ${this.tempFeelsLike}°С</p>
            </div>
            <div class="d-flex justify-content-around speed">
                <p class="innerP"><i class="far fa-compass"></i> ${this.windDeg}</p>
                <p><i class="fas fa-wind"></i> ${this.windSpeed} m/s</p>
            </div>
        </header>
    `
    content.insertAdjacentHTML('beforeend', template);
    }


    secondRender() {
        this.listDays.forEach(item => {
		    const date = this._dtDayForecast(item.dt_txt) + ' ' + this._dtMonthForecast(item.dt_txt) + ' 12:00 a.m.';
		    const icon = item.weather[0].icon;
		    const temp = Math.round(item.main.temp - kelvin);


        const template2 = `
            <div class="nextDay d-flex justify-content-between align-items-center" >
                <h6>${date}</h6>
                <img src="http://openweathermap.org/img/wn/${icon}@2x.png">
                <h6>${temp} °С</h6>
            </div>
            
        `
        sectionNode.innerHTML = sectionNode.innerHTML + template2;

    })
    content.append(sectionNode);
    }
}

const arrData = [];

fetchData('GET', urlWeather)
	.then(data => arrData.push(data))
	.then(() => fetchData('GET', urlWeather5))
	.then(data => arrData.push(data))
	.then(res => {
        const weather1 = new Weather(arrData);
        weather1.firstRender();
        weather1.secondRender();
    })
    .catch((error) => console.log(error))